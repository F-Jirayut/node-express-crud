const jwt = require('jsonwebtoken');
require('dotenv').config();
const BlacklistedToken = require('../models/BlacklistedToken');

const isTokenBlacklisted = async (token) => {
  const blacklisted = await BlacklistedToken.findOne({ where: { token } });
  if (!blacklisted){
    return false;
  }
  return blacklisted.revoked || blacklisted.expiresAt < new Date();
};

async function authenticateJWT(req, res, next) {
  try {
    const token = req.headers['authorization']?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token is blacklisted or expired' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) return res.status(401).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = authenticateJWT;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
require('dotenv').config();
const { deleteFromRedis } = require('../helpers/redisHelper');

const register = async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;
  try {
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ email }, { username }]
      }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
    });
    await deleteFromRedis('all_users');
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await BlacklistedToken.create({
      token,
      expiresAt,
      revoked: true,
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, logout };

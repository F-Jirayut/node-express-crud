const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const BlacklistedToken = sequelize.define('BlacklistedToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'blacklisted_tokens',
});

module.exports = BlacklistedToken;

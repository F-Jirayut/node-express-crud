require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

async function authenticate() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('ไม่สามารถเชื่อมต่อ PostgreSQL:', error);
  }
}

authenticate();

module.exports = sequelize;

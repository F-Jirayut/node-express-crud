const { initRedis } = require('../services/redisClient');

async function getFromRedis(key) {
  try {
    const redisClient = await initRedis();
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis Error (get):', err.message);
    return null;
  }
}

async function setToRedis(key, value, expire = 3600) {
  try {
    const redisClient = await initRedis();
    await redisClient.set(key, JSON.stringify(value), { EX: expire });
  } catch (err) {
    console.error('Redis Error (set):', err.message);
  }
}

async function deleteFromRedis(key) {
  try {
    const redisClient = await initRedis();
    await redisClient.del(key);
  } catch (err) {
    console.error('Redis Error (delete):', err.message);
  }
}

module.exports = { getFromRedis, setToRedis, deleteFromRedis };

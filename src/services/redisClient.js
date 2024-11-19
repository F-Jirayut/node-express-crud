const redis = require('redis');

let client;

async function initRedis() {
  if (!client) {
    client = redis.createClient({
      url: 'redis://redis:6379',
    });

    client.on('connect', () => {
      console.log('เชื่อมต่อ Redis สำเร็จ');
    });

    client.on('error', (err) => {
      console.error('ข้อผิดพลาดการเชื่อมต่อ Redis:', err);
    });

    await client.connect();
  }
  return client;
}

module.exports = { initRedis };

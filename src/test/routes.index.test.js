const request = require('supertest');
const app = require('../app');

describe('Routes Integration Test', () => {
    it('should return "Welcome to the Express App!" on GET /', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Welcome to the Express App!');
    });
  
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/unknown-route');
      expect(res.status).toBe(404);
    });
});

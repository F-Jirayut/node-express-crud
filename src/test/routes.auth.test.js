const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from app.js
const bcrypt = require('bcrypt');
const { deleteFromRedis } = require('../helpers/redisHelper');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../models/BlacklistedToken');
jest.mock('../helpers/redisHelper');
jest.mock('jsonwebtoken');
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hashSync: jest.fn(),
}));

describe('Authentication Routes', () => {
  
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockResolvedValue(newUser);

      const response = await request(app)
        .post('/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.username,
      }));
    });

    it('should return 400 if email or username already exists', async () => {
      const existingUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(existingUser); // Mock existing user

      const response = await request(app)
        .post('/register')
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username or Email already exists');
    });
  });

  describe('POST /login', () => {
    it('should login successfully and return an access token', async () => {
      const loginData = { username: 'johndoe', password: 'password123' };
      const user = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'hashedpassword'
      };

      // Mock user lookup and password comparison
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);  // Mock bcrypt compare
      jwt.sign.mockReturnValue('fake-jwt-token');

      const response = await request(app)
        .post('/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe('fake-jwt-token');
    });

    it('should return 401 if password is invalid', async () => {
      const loginData = { username: 'johndoe', password: 'wrongpassword' };
      const user = { username: 'johndoe', password: 'hashedpassword' };

      // Mock user lookup and invalid password
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid password');
    });
  });

  describe('POST /logout', () => {
    it('should successfully logout and blacklist the token', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 }; // Mock decoded JWT

      // Mock JWT decoding and blacklisting
      jwt.decode.mockReturnValue(decodedToken);
      BlacklistedToken.create.mockResolvedValue(true);

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
      expect(BlacklistedToken.create).toHaveBeenCalledWith(expect.objectContaining({
        token,
        expiresAt: new Date(decodedToken.exp * 1000),
        revoked: true,
      }));
    });

    it('should return 400 if no token is provided', async () => {
      const response = await request(app)
        .post('/logout');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token is required');
    });

    it('should return 400 if token is invalid', async () => {
      const token = 'invalid-token';

      // Mock invalid token decoding
      jwt.decode.mockReturnValue(null);

      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid token');
    });
  });
});

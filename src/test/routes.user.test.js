const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { getFromRedis, setToRedis, deleteFromRedis } = require('../helpers/redisHelper');

// Mock User model and Redis helper functions
jest.mock('../models/User');
jest.mock('../helpers/redisHelper');

let token;

beforeAll(async () => {
//   // Create a new user (mock data)
//   await User.create({
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john.doe@example.com',
//     password: 'password123',
//     username: 'john_doe'
//   });

//   // Log in to get JWT token
//   const loginResponse = await request(app)
//     .post('/login')
//     .send({
//       username: 'john_doe',
//       password: 'password123'
//     });

//   token = loginResponse.body.token;  // Store the token for future use
});


describe('User Routes', () => {
  // Clear Redis mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test createUser
  describe('POST /users', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        username: 'johndoe',
      };

      // Mock User.create to return a fake user
      User.create.mockResolvedValue(newUser);

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(newUser);
      expect(deleteFromRedis).toHaveBeenCalledWith('all_users');  // Verify Redis cache deletion
    });

    it('should return 500 if an error occurs while creating user', async () => {
      const newUser = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password123', username: 'johndoe' };

      User.create.mockRejectedValue(new Error('Something went wrong'));

      const response = await request(app).post('/users').send(newUser).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Something went wrong');
    });
  });

  // Test getAllUsers
  describe('GET /users', () => {
    it('should return a list of users', async () => {
      const users = [{ firstName: 'John', lastName: 'Doe' }];

      getFromRedis.mockResolvedValue(users);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(users);
    });

    it('should fetch users from database if not in cache', async () => {
      const users = [{ firstName: 'John', lastName: 'Doe' }];

      getFromRedis.mockResolvedValue(null);  // Simulate cache miss
      User.findAll.mockResolvedValue(users);  // Simulate database query

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(users);
      expect(setToRedis).toHaveBeenCalledWith('all_users', users);  // Ensure Redis cache is set
    });
  });

  // Test getUserById
  describe('GET /users/:id', () => {
    it('should return user details by id', async () => {
      const user = { firstName: 'John', lastName: 'Doe' };

      getFromRedis.mockResolvedValue(user);

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(user);
    });

    it('should fetch user from database if not in cache', async () => {
      const user = { firstName: 'John', lastName: 'Doe' };

      getFromRedis.mockResolvedValue(null);  // Simulate cache miss
      User.findByPk.mockResolvedValue(user);  // Simulate database query

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(user);
      expect(setToRedis).toHaveBeenCalledWith('user_1', user);  // Ensure Redis cache is set
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);  // Simulate user not found

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  // Test updateUser
  describe('PUT /users/:id', () => {
    it('should update user details successfully', async () => {
      const user = { id: 1, firstName: 'John', lastName: 'Doe' };
      const updatedUser = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', username: 'johnnydoe' };

      User.findByPk.mockResolvedValue(user);
      user.update.mockResolvedValue(updatedUser);

      const response = await request(app).put('/users/1').send(updatedUser).set('Authorization', `Bearer ${token}`);;

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(deleteFromRedis).toHaveBeenCalledWith('all_users');
      expect(deleteFromRedis).toHaveBeenCalledWith('user_1');
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const response = await request(app).put('/users/1').send({ firstName: 'John' }).set('Authorization', `Bearer ${token}`);;

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  // Test deleteUser
  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      const user = { id: 1, firstName: 'John', lastName: 'Doe' };

      User.findByPk.mockResolvedValue(user);
      user.destroy.mockResolvedValue();

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(204);
      expect(deleteFromRedis).toHaveBeenCalledWith('all_users');
      expect(deleteFromRedis).toHaveBeenCalledWith('user_1');
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
});

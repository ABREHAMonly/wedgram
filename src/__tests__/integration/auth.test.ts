// backend/src/__tests__/integration/auth.test.ts
import request from 'supertest';
import app from '../../app';
import User from '../../models/User.model';
import { generateTestToken } from '../setup';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    // Clear users collection
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      weddingDate: tomorrow.toISOString(),
      partnerName: 'Jane Doe',
      weddingLocation: 'New York',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });

  it('should return 409 for duplicate email', async () => {
    // First, create a user
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const firstUserData = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      weddingDate: tomorrow.toISOString(),
      partnerName: 'Partner',
      weddingLocation: 'Location',
    };

    await request(app)
      .post('/api/v1/auth/register')
      .send(firstUserData)
      .expect(201);

    // Try to create another user with same email
    const duplicateUserData = {
      name: 'Duplicate User',
      email: 'existing@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      weddingDate: tomorrow.toISOString(),
      partnerName: 'Partner',
      weddingLocation: 'Location',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(duplicateUserData)
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('already');
  });

    it('should return 400 for password mismatch', async () => {
      const userData = {
  name: 'John Doe',
  email: 'existing@example.com',
  password: 'Password123',
  weddingDate: '2024-12-31',
};

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'inviter',
        isActive: true,
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let authToken: string;
    let testUser: any;

    beforeEach(async () => {
      // Create test user and get token
      testUser = await User.create({
        name: 'Profile Test User',
        email: 'profile@example.com',
        password: 'Password123!',
        role: 'inviter',
        weddingDate: new Date('2024-12-31'),
        partnerName: 'Partner Name',
        weddingLocation: 'Test Location',
      });

      authToken = generateTestToken(testUser._id.toString(), 'inviter');
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
      expect(response.body.data.role).toBe(testUser.role);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    let authToken: string;
    let testUser: any;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Update Test User',
        email: 'update@example.com',
        password: 'Password123!',
        role: 'inviter',
        phone: '+1234567890',
      });

      authToken = generateTestToken(testUser._id.toString(), 'inviter');
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+0987654321',
        weddingLocation: 'Updated Location',
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.weddingLocation).toBe(updateData.weddingLocation);

      // Verify database update
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.phone).toBe(updateData.phone);
    });

    it('should return 409 when trying to use existing email', async () => {
      // Create another user with different email
      await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!',
        role: 'inviter',
      });

      const updateData = {
        email: 'other@example.com', // Trying to use existing email
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should allow updating to same email', async () => {
      const updateData = {
        email: 'update@example.com', // Same email
        name: 'New Name',
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });
});
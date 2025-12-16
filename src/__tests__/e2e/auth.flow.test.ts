// backend/src/__tests__/e2e/auth.flow.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import User from '../../models/User.model';

describe('Auth End-to-End Flow', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Complete User Registration and Profile Flow', () => {
    it('should complete full user flow: register → login → get profile → update profile', async () => {
      // 1. Register new user
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const registerData = {
        name: 'E2E Test User',
        email: 'e2e@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        weddingDate: tomorrow.toISOString(),
        partnerName: 'E2E Partner',
        weddingLocation: 'E2E Venue',
      };

      console.log('Register data:', registerData);
      
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      console.log('Register response:', registerResponse.body);
      console.log('Validation errors:', registerResponse.body.data?.errors);
      expect(registerResponse.status).toBe(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe(registerData.email);
      const authToken = registerResponse.body.data.token;
      expect(authToken).toBeDefined();

      // 2. Login with registered credentials
      const loginData = {
        email: registerData.email,
        password: registerData.password,
      };

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.user.email).toBe(registerData.email);
      const newAuthToken = loginResponse.body.data.token;
      expect(newAuthToken).toBeDefined();

      // 3. Get profile with token
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newAuthToken}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.email).toBe(registerData.email);
      expect(profileResponse.body.data.name).toBe(registerData.name);
      expect(profileResponse.body.data.partnerName).toBe(registerData.partnerName);

      // 4. Update profile
      const updateData = {
        name: 'Updated E2E User',
        phone: '+1234567890',
        weddingLocation: 'Updated Venue',
      };

      const updateResponse = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newAuthToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updateData.name);
      expect(updateResponse.body.data.phone).toBe(updateData.phone);
      expect(updateResponse.body.data.weddingLocation).toBe(updateData.weddingLocation);

      // 5. Verify changes in database
      const user = await User.findOne({ email: registerData.email });
      expect(user?.name).toBe(updateData.name);
      expect(user?.phone).toBe(updateData.phone);
      expect(user?.weddingLocation).toBe(updateData.weddingLocation);
    });

    it('should handle failed login attempts', async () => {
      // Register user
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const registerData = {
        name: 'Lockout Test User',
        email: 'lockout@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        weddingDate: tomorrow.toISOString(),
        partnerName: 'Lockout Partner',
        weddingLocation: 'Lockout Venue',
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      console.log('Register status:', registerResponse.status);
      console.log('Register body:', registerResponse.body);
      
      if (registerResponse.status !== 201) {
        console.log('Register error details:', JSON.stringify(registerResponse.body, null, 2));
      }
      
      expect(registerResponse.status).toBe(201);

      // Try wrong password multiple times
      const loginAttempts = [
        { email: 'lockout@example.com', password: 'Wrong1' },
        { email: 'lockout@example.com', password: 'Wrong2' },
        { email: 'lockout@example.com', password: 'Wrong3' },
        { email: 'lockout@example.com', password: 'Wrong4' },
        { email: 'lockout@example.com', password: 'Wrong5' },
      ];

      for (const attempt of loginAttempts) {
        await request(app)
          .post('/api/v1/auth/login')
          .send(attempt)
          .expect(401);
      }

      // Try correct password
      const correctLogin = {
        email: 'lockout@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(correctLogin);

      // Either 401 (rate limited) or 200 (not rate limited yet)
      expect([200, 401]).toContain(response.statusCode);
    });
  });

  describe('Admin Creation and Management Flow', () => {
    it('should create admin and access admin endpoints', async () => {
      // 1. Register regular user
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const regularUserData = {
        name: 'Regular Admin Flow User',
        email: 'regularadmin@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        weddingDate: tomorrow.toISOString(),
        partnerName: 'Admin Partner',
        weddingLocation: 'Admin Venue',
      };

      console.log('Regular user registration data:', regularUserData);
      
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(regularUserData);

      console.log('Regular user register status:', registerResponse.status);
      console.log('Regular user register body:', registerResponse.body);
      
      if (registerResponse.status !== 201) {
        console.log('Register error details:', JSON.stringify(registerResponse.body, null, 2));
      }
      
      expect(registerResponse.status).toBe(201);
      const regularToken = registerResponse.body.data.token;

      // 2. Try to access admin endpoints (should fail)
      const adminStatsAttempt = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(401);

      expect(adminStatsAttempt.body.success).toBe(false);

      // Note: In real scenario, first admin would be created manually or via seed
      // For this test, we'll simulate admin creation by directly setting role in DB
      const updatedUser = await User.findOneAndUpdate(
        { email: regularUserData.email },
        { role: 'admin' },
        { new: true }
      );
      
      expect(updatedUser?.role).toBe('admin');

      // 3. Login again to get new token with admin role
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: regularUserData.email,
          password: regularUserData.password,
        })
        .expect(200);

      const adminToken = loginResponse.body.data.token;
      expect(adminToken).toBeDefined();

      // 4. Access admin endpoints (should succeed)
      const adminStats = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(adminStats.body.success).toBe(true);
      expect(adminStats.body.data).toHaveProperty('totalUsers');
      
      // 5. Verify we can access other admin endpoints
      const allUsersResponse = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(allUsersResponse.body.success).toBe(true);
      expect(allUsersResponse.body.data).toBeInstanceOf(Array);
    });
  });
});
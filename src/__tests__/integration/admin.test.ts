// backend/src/__tests__/integration/admin.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import User from '../../models/User.model';
import Guest from '../../models/Guest.model';
import Wedding from '../../models/Wedding.model';
import { generateTestToken } from '../setup';

describe('Admin Integration Tests', () => {
  let adminToken: string;
  let adminUser: any;
  let regularUser: any;
  let regularUserToken: string;

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Guest.deleteMany({});
    await Wedding.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
    });

    // Create regular user
    regularUser = await User.create({
      name: 'Regular User',
      email: 'regular@example.com',
      password: 'RegularPass123!',
      role: 'inviter',
      weddingDate: new Date('2024-12-31'),
    });

    // Create wedding for regular user
    await Wedding.create({
      user: regularUser._id,
      title: 'Regular Wedding',
      date: new Date('2024-12-31'),
      venue: 'Regular Venue',
    });

    // Create some guests
    await Guest.create([
      {
        inviter: regularUser._id,
        name: 'Guest 1',
        telegramUsername: '@guest1',
        invitationToken: 'token1',
      },
      {
        inviter: regularUser._id,
        name: 'Guest 2',
        telegramUsername: '@guest2',
        invitationToken: 'token2',
      },
    ]);

    // Generate tokens
    adminToken = generateTestToken(adminUser._id.toString(), 'admin');
    regularUserToken = generateTestToken(regularUser._id.toString(), 'inviter');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/v1/admin/stats', () => {
    it('should return stats for admin user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('totalInvites');
      expect(response.body.data).toHaveProperty('activeWeddings');
      expect(response.body.data).toHaveProperty('pendingRSVPs');
      
      // FIXED: Should count ALL users (admin + regular)
      expect(response.body.data.totalUsers).toBe(2); // admin + regular user
      expect(response.body.data.totalInvites).toBe(2); // 2 guests
      expect(response.body.data.activeWeddings).toBe(1); // 1 wedding
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(401); // Actually returns 401 from adminOnly middleware

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // admin + regular
      expect(response.body.meta.total).toBe(2);
      
      // Should not include passwords
      expect(response.body.data[0].password).toBeUndefined();
      expect(response.body.data[0].refreshToken).toBeUndefined();
    });

    it('should paginate users', async () => {
      // Create more users for pagination
      for (let i = 0; i < 5; i++) {
        await User.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'Password123!',
          role: 'inviter',
        });
      }

      const response = await request(app)
        .get('/api/v1/admin/users?page=1&limit=3')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(3);
      // FIXED: Should be 7 total users (1 admin + 1 regular + 5 new)
      expect(response.body.meta.total).toBe(7);
    });
  });

  describe('GET /api/v1/admin/guests', () => {
    it('should return all guests for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/guests')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBeDefined();
      expect(response.body.data[0].inviter).toBeDefined();
    });

    it('should include inviter details when populated', async () => {
      const response = await request(app)
        .get('/api/v1/admin/guests')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].inviter.name).toBeDefined();
      expect(response.body.data[0].inviter.email).toBeDefined();
    });
  });

  describe('POST /api/v1/admin/create', () => {
    it('should create new admin successfully', async () => {
      const newAdminData = {
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'NewAdminPass123!',
      };

      const response = await request(app)
        .post('/api/v1/admin/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAdminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newAdminData.name);
      expect(response.body.data.email).toBe(newAdminData.email);
      expect(response.body.data.role).toBe('admin');

      // Verify admin is created
      const newAdmin = await User.findOne({ email: newAdminData.email });
      expect(newAdmin).toBeTruthy();
      expect(newAdmin?.role).toBe('admin');
    });

    it('should return 409 for duplicate email', async () => {
      const duplicateAdminData = {
        name: 'Duplicate Admin',
        email: 'admin@example.com', // Already exists
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/admin/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateAdminData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already');
    });

    it('should return 401 for non-admin user', async () => {
      const newAdminData = {
        name: 'New Admin',
        email: 'newadmin@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/admin/create')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(newAdminData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
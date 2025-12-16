// backend/src/__tests__/integration/invite.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import User from '../../models/User.model';
import Guest from '../../models/Guest.model';
import Wedding from '../../models/Wedding.model';
import RSVP from '../../models/RSVP.model';

describe('RSVP Integration Tests', () => {
  let testUser: any;
  let wedding: any;
  let guest: any;
  const invitationToken = 'test-invitation-token-123';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    }
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Guest.deleteMany({});
    await Wedding.deleteMany({});
    await RSVP.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'RSVP Test User',
      email: 'rsvp@example.com',
      password: 'Password123!',
      role: 'inviter',
    });

    // Create wedding
    wedding = await Wedding.create({
      user: testUser._id,
      title: 'RSVP Test Wedding',
      date: new Date('2024-12-31'),
      venue: 'Test Venue',
    });

    // Create guest with invitation
    guest = await Guest.create({
      inviter: testUser._id,
      name: 'RSVP Guest',
      telegramUsername: '@rsvpguest',
      invitationToken,
      invited: true,
      hasRSVPed: false,
      rsvpStatus: 'pending',
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/rsvp/:token', () => {
    it('should submit RSVP successfully', async () => {
      const rsvpData = {
        response: 'accepted',
        attendingCount: 2,
        message: 'Looking forward to it!',
        dietaryRestrictions: 'Vegetarian',
      };

      const response = await request(app)
        .post(`/api/v1/rsvp/${invitationToken}`)
        .send(rsvpData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('submitted');
      expect(response.body.data.rsvp.response).toBe('accepted');
      expect(response.body.data.guest.name).toBe(guest.name);

      // Verify RSVP is saved
      const savedRSVP = await RSVP.findOne({ guest: guest._id });
      expect(savedRSVP).toBeTruthy();
      expect(savedRSVP?.response).toBe('accepted');
      expect(savedRSVP?.attendingCount).toBe(2);

      // Verify guest is updated
      const updatedGuest = await Guest.findById(guest._id);
      expect(updatedGuest?.hasRSVPed).toBe(true);
      expect(updatedGuest?.rsvpStatus).toBe('accepted');
      expect(updatedGuest?.rsvpSubmittedAt).toBeDefined();
    });

    it('should return 404 for invalid invitation token', async () => {
      const rsvpData = {
        response: 'accepted',
      };

      const response = await request(app)
        .post('/api/v1/rsvp/invalid-token')
        .send(rsvpData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 if invitation not sent yet', async () => {
      // Create guest without invitation
      const notInvitedGuest = await Guest.create({
        inviter: testUser._id,
        name: 'Not Invited Guest',
        telegramUsername: '@notinvited',
        invitationToken: 'not-invited-token',
        invited: false, // Not invited
      });

      const rsvpData = {
        response: 'accepted',
      };

      const response = await request(app)
        .post(`/api/v1/rsvp/${notInvitedGuest.invitationToken}`)
        .send(rsvpData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not sent');
    });

    it('should return 400 if RSVP already submitted', async () => {
      // Create RSVP first
      await RSVP.create({
        guest: guest._id,
        wedding: wedding._id,
        response: 'accepted',
        attendingCount: 1,
      });

      // Update guest to have RSVP
      await Guest.findByIdAndUpdate(guest._id, {
        hasRSVPed: true,
        rsvpStatus: 'accepted',
      });

      const rsvpData = {
        response: 'declined', // Trying to change RSVP
      };

      const response = await request(app)
        .post(`/api/v1/rsvp/${invitationToken}`)
        .send(rsvpData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already');
    });

    it('should validate RSVP data', async () => {
      const invalidRsvpData = {
        response: 'invalid-response', // Invalid response
        attendingCount: 0, // Too low
      };

      const response = await request(app)
        .post(`/api/v1/rsvp/${invitationToken}`)
        .send(invalidRsvpData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/rsvp/:token', () => {
    it('should get RSVP status for valid token', async () => {
      const response = await request(app)
        .get(`/api/v1/rsvp/${invitationToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.guest.name).toBe(guest.name);
      expect(response.body.data.guest.rsvpStatus).toBe('pending');
      expect(response.body.data.wedding.title).toBe(wedding.title);
    });

    it('should include RSVP details if submitted', async () => {
      // Create RSVP
      await RSVP.create({
        guest: guest._id,
        wedding: wedding._id,
        response: 'maybe',
        attendingCount: 1,
        message: 'Not sure yet',
      });

      await Guest.findByIdAndUpdate(guest._id, {
        hasRSVPed: true,
        rsvpStatus: 'maybe',
        rsvpSubmittedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/v1/rsvp/${invitationToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.guest.hasRSVPed).toBe(true);
      expect(response.body.data.rsvp.response).toBe('maybe');
      expect(response.body.data.rsvp.message).toBe('Not sure yet');
    });

    it('should return 404 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/rsvp/invalid-token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
// backend/src/__tests__/e2e/invite.flow.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import User from '../../models/User.model';
import Wedding from '../../models/Wedding.model';
import Guest from '../../models/Guest.model';
import RSVP from '../../models/RSVP.model';

describe('Invite End-to-End Flow', () => {
  let authToken: string;
  let testUser: any;
  let wedding: any;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    }
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Wedding.deleteMany({});
    await Guest.deleteMany({});
    await RSVP.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Invite Flow User',
      email: 'inviteflow@example.com',
      password: 'Password123!',
      role: 'inviter',
    });

    // Create wedding
    wedding = await Wedding.create({
      user: testUser._id,
      title: 'Invite Flow Wedding',
      date: new Date('2024-12-31'),
      venue: 'Flow Venue',
    });

    // Generate token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { userId: testUser._id.toString(), role: 'inviter' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Complete Invitation Flow', () => {
    it('should complete full invitation flow: create → send → RSVP → track', async () => {
      // 1. Create invitations
      const guestsData = [
        {
          name: 'Flow Guest 1',
          email: 'flowguest1@example.com',
          telegramUsername: '@flowguest1',
          invitationMethod: 'email',
          plusOneAllowed: true,
        },
        {
          name: 'Flow Guest 2',
          telegramUsername: '@flowguest2',
          invitationMethod: 'telegram',
          plusOneAllowed: false,
        },
      ];

      const createResponse = await request(app)
        .post('/api/v1/invites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guests: guestsData,
          sendImmediately: false,
        })
        .expect(200);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.results).toHaveLength(2);

      // Verify guests created
      const createdGuests = await Guest.find({ inviter: testUser._id });
      expect(createdGuests).toHaveLength(2);
      
      const guest1 = createdGuests[0];
      const guest2 = createdGuests[1];

      // 2. Send invitations
      // Mock external services
      jest.mock('../../services/email.service', () => ({
        sendInvitation: jest.fn().mockResolvedValue(true),
        isConfigured: jest.fn().mockReturnValue(true),
      }));

      jest.mock('../../services/telegram.service', () => ({
        sendInvitation: jest.fn().mockResolvedValue(true),
        isBotActive: jest.fn().mockReturnValue(true),
      }));

      const sendResponse = await request(app)
        .post('/api/v1/invites/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          guestIds: [guest1._id.toString(), guest2._id.toString()],
        })
        .expect(200);

      expect(sendResponse.body.success).toBe(true);

      // Verify guests marked as invited
      const updatedGuests = await Guest.find({ inviter: testUser._id });
      expect(updatedGuests[0].invited).toBe(true);
      expect(updatedGuests[0].invitationSentAt).toBeDefined();

      // 3. Guest RSVPs
      const rsvpData = {
        response: 'accepted',
        attendingCount: 2,
        message: 'Excited to attend!',
        dietaryRestrictions: 'None',
      };

      const rsvpResponse = await request(app)
        .post(`/api/v1/rsvp/${guest1.invitationToken}`)
        .send(rsvpData)
        .expect(200);

      expect(rsvpResponse.body.success).toBe(true);
      expect(rsvpResponse.body.data.rsvp.response).toBe('accepted');

      // 4. Check RSVP status
      const statusResponse = await request(app)
        .get(`/api/v1/rsvp/${guest1.invitationToken}`)
        .expect(200);

      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.data.guest.hasRSVPed).toBe(true);
      expect(statusResponse.body.data.rsvp.response).toBe('accepted');

      // 5. Inviter checks guest list with filters
      const guestsResponse = await request(app)
        .get('/api/v1/invites?status=accepted')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(guestsResponse.body.success).toBe(true);
      expect(guestsResponse.body.data).toHaveLength(1);
      expect(guestsResponse.body.data[0].rsvpStatus).toBe('accepted');

      // 6. Check pending invitations
      const pendingResponse = await request(app)
        .get('/api/v1/invites?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(pendingResponse.body.success).toBe(true);
      expect(pendingResponse.body.data).toHaveLength(1);
      expect(pendingResponse.body.data[0].rsvpStatus).toBe('pending');
    });

    it('should handle multiple RSVP scenarios', async () => {
      // Create guests with different statuses
      const guests = await Guest.create([
        {
          inviter: testUser._id,
          name: 'Accepted Guest',
          telegramUsername: '@accepted',
          invitationToken: 'token-accepted',
          invited: true,
          hasRSVPed: true,
          rsvpStatus: 'accepted',
        },
        {
          inviter: testUser._id,
          name: 'Declined Guest',
          telegramUsername: '@declined',
          invitationToken: 'token-declined',
          invited: true,
          hasRSVPed: true,
          rsvpStatus: 'declined',
        },
        {
          inviter: testUser._id,
          name: 'Maybe Guest',
          telegramUsername: '@maybe',
          invitationToken: 'token-maybe',
          invited: true,
          hasRSVPed: true,
          rsvpStatus: 'maybe',
        },
        {
          inviter: testUser._id,
          name: 'Pending Guest',
          telegramUsername: '@pending',
          invitationToken: 'token-pending',
          invited: true,
          hasRSVPed: false,
          rsvpStatus: 'pending',
        },
      ]);

      // Create RSVPs for those who responded
      await RSVP.create([
        {
          guest: guests[0]._id,
          wedding: wedding._id,
          response: 'accepted',
          attendingCount: 2,
        },
        {
          guest: guests[1]._id,
          wedding: wedding._id,
          response: 'declined',
          attendingCount: 0,
          message: 'Cannot make it',
        },
        {
          guest: guests[2]._id,
          wedding: wedding._id,
          response: 'maybe',
          attendingCount: 1,
          message: 'Will confirm later',
        },
      ]);

      // Check stats by fetching all and filtering in test
      const allGuestsResponse = await request(app)
        .get('/api/v1/invites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(allGuestsResponse.body.success).toBe(true);
      expect(allGuestsResponse.body.data).toHaveLength(4);

      const accepted = allGuestsResponse.body.data.filter((g: any) => g.rsvpStatus === 'accepted');
      const declined = allGuestsResponse.body.data.filter((g: any) => g.rsvpStatus === 'declined');
      const maybe = allGuestsResponse.body.data.filter((g: any) => g.rsvpStatus === 'maybe');
      const pending = allGuestsResponse.body.data.filter((g: any) => g.rsvpStatus === 'pending');

      expect(accepted).toHaveLength(1);
      expect(declined).toHaveLength(1);
      expect(maybe).toHaveLength(1);
      expect(pending).toHaveLength(1);
    });

    it('should handle bulk operations', async () => {
      // Create many guests
      const guestPromises = [];
      for (let i = 0; i < 25; i++) {
        guestPromises.push(
          Guest.create({
            inviter: testUser._id,
            name: `Bulk Guest ${i}`,
            telegramUsername: `@bulkguest${i}`,
            invitationToken: `bulk-token-${i}`,
            invited: i % 2 === 0, // Half invited
            hasRSVPed: i % 3 === 0, // Third have RSVPed
            rsvpStatus: i % 3 === 0 ? 'accepted' : 'pending',
          })
        );
      }

      await Promise.all(guestPromises);

      // Test pagination
      const page1Response = await request(app)
        .get('/api/v1/invites?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(page1Response.body.success).toBe(true);
      expect(page1Response.body.data).toHaveLength(10);
      expect(page1Response.body.meta.page).toBe(1);
      expect(page1Response.body.meta.limit).toBe(10);
      expect(page1Response.body.meta.total).toBe(25);
      expect(page1Response.body.meta.totalPages).toBe(3);

      // Test page 2
      const page2Response = await request(app)
        .get('/api/v1/invites?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(page2Response.body.success).toBe(true);
      expect(page2Response.body.data).toHaveLength(10);
      expect(page2Response.body.meta.page).toBe(2);

      // Test page 3 (last page with remaining items)
      const page3Response = await request(app)
        .get('/api/v1/invites?page=3&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(page3Response.body.success).toBe(true);
      expect(page3Response.body.data).toHaveLength(5);
      expect(page3Response.body.meta.page).toBe(3);
    });
  });
});
// backend/src/__tests__/unit/services/email.service.test.ts
// Mock nodemailer FIRST
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
    verify: jest.fn().mockResolvedValue(true),
  })),
}));

// Now import after mocking
import { EmailService } from '../../../services/email.service';
import nodemailer from 'nodemailer';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup environment variables
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'testpass';
    process.env.EMAIL_FROM = 'noreply@wedgram.com';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_FROM;
  });

  describe('sendInvitation', () => {
    it('should send invitation email successfully', async () => {
      // Mock the sendMail function
      const mockSendMail = jest.fn().mockResolvedValue({});
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: mockSendMail,
        verify: jest.fn().mockResolvedValue(true),
      });
      
      emailService = new EmailService();
      const result = await emailService.sendInvitation(
        'guest@example.com',
        'John Doe',
        'http://localhost:3000/invite/token123'
      );
      
      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'guest@example.com',
          subject: '🎉 You\'re Invited to a Wedding!',
          from: '"WedGram" <noreply@wedgram.com>',
        })
      );
    });

    it('should return false when email sending fails', async () => {
      const mockSendMail = jest.fn().mockRejectedValue(new Error('SMTP error'));
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: mockSendMail,
        verify: jest.fn().mockResolvedValue(true),
      });
      
      emailService = new EmailService();
      const result = await emailService.sendInvitation(
        'guest@example.com',
        'John Doe',
        'http://localhost:3000/invite/token123'
      );
      
      expect(result).toBe(false);
    });
  });
});
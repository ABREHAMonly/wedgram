// backend/src/services/email.service.ts
import nodemailer from 'nodemailer';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      logger.warn('⚠️ Email configuration missing. Email service will not be available.');
      this.initialized = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: SMTP_PORT === '465',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.initialized = true;
      logger.info('✅ Email service initialized');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.initialized = false;
    }
  }

  async sendInvitation(email: string, guestName: string, inviteLink: string): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.warn('Email service not configured');
      return false;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; }
          .content { padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Wedding Invitation</h1>
          </div>
          <div class="content">
            <h2>Dear ${guestName},</h2>
            <p>You're cordially invited to celebrate a special wedding ceremony!</p>
            <p>Click below to view your invitation and RSVP:</p>
            <p style="text-align: center;">
              <a href="${inviteLink}" class="button">View Invitation</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 You\'re Invited to a Wedding!',
      html,
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter!.sendMail({
        from: options.from || `"WedGram" <${process.env.EMAIL_FROM || 'noreply@wedgram.com'}>`,
        ...options,
      });
      logger.info(`✅ Email sent to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return this.initialized && this.transporter !== null;
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
// backend/src/services/telegram.service.ts
import TelegramBot from 'node-telegram-bot-api';
import logger from '../utils/logger';
class TelegramService {
  private bot: TelegramBot | null = null;
  private isActive = false;

  async initialize(): Promise<void> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      logger.warn('⚠️ TELEGRAM_BOT_TOKEN not provided. Telegram bot will not start.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupEventListeners();
      this.isActive = true;
      
      logger.info('🤖 Telegram bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Telegram bot:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.bot) return;

    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramUsername = msg.from?.username;

      if (!telegramUsername) {
        await this.bot?.sendMessage(
          chatId,
          '👋 Welcome to WedGram! Please set a Telegram username to use this service.'
        );
        return;
      }

      await this.bot?.sendMessage(
        chatId,
        `👋 Welcome to WedGram!\n\nYour username: @${telegramUsername}\n\nPlease share this username with your host to receive your wedding invitation.`
      );
    });

    this.bot.on('polling_error', (error) => {
      logger.error('Telegram polling error:', error);
    });
  }

  async sendInvitation(chatId: string, guestName: string, inviteLink: string): Promise<boolean> {
    if (!this.bot || !this.isActive) {
      logger.warn('Telegram bot is not active');
      return false;
    }

    try {
      await this.bot.sendMessage(
        chatId,
        `🎉 Dear ${guestName},\n\nYou're invited to a wedding! 🥂\n\nClick here to view your invitation: ${inviteLink}\n\nPlease RSVP through the link!`
      );
      return true;
    } catch (error) {
      logger.error('Error sending Telegram invitation:', error);
      return false;
    }
  }

  isBotActive(): boolean {
    return this.isActive;
  }
}

export default new TelegramService();
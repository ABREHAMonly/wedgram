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

    // In the /start command handler in telegram.service.ts
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

  logger.info(`User started bot: @${telegramUsername}, chatId: ${chatId}`)
  
  try {
    // Import Guest model
    const Guest = require('../models/Guest.model').default
    
    // Look for guest by telegram username (with or without @)
    const guest = await Guest.findOne({
      telegramUsername: { 
        $in: [
          telegramUsername,
          `@${telegramUsername}`,
          telegramUsername.replace('@', '')
        ]
      }
    });
    
    if (guest) {
      logger.info(`Found guest record for @${telegramUsername}`)
      
      // Update chatId
      guest.chatId = chatId.toString();
      await guest.save();
      
      logger.info(`Updated guest ${guest.name} with chatId: ${chatId}`)
      
      // Check if we should send the invitation now
      if (!guest.invited) {
        logger.info(`Guest ${guest.name} hasn't been invited yet, sending invitation...`)
        
        // Get wedding info
        const Wedding = require('../models/Wedding.model').default
        const wedding = await Wedding.findOne({ user: guest.inviter });
        
        if (wedding) {
          const { generateInviteLink } = require('../utils/helpers');
          const inviteLink = generateInviteLink(guest.invitationToken);
          
          const sent = await this.sendInvitation(chatId.toString(), guest.name, inviteLink);
          
          if (sent) {
            guest.invited = true;
            guest.invitationSentAt = new Date();
            await guest.save();
            logger.info(`Invitation sent successfully to ${guest.name}`)
          }
        }
      }
      
      await this.bot?.sendMessage(
        chatId,
        `👋 Welcome to WedGram, ${guest.name}!\n\nYour wedding invitation has been sent. Please check your messages.`
      );
    } else {
      logger.warn(`No guest found for username: @${telegramUsername}`)
      await this.bot?.sendMessage(
        chatId,
        `👋 Welcome to WedGram!\n\nYour username: @${telegramUsername}\n\nPlease share this username with your host to receive your wedding invitation.`
      );
    }
  } catch (error) {
    console.error('Error handling /start command:', error);
    await this.bot?.sendMessage(
      chatId,
      'An error occurred. Please try again later.'
    );
  }
});

    this.bot.on('polling_error', (error) => {
      logger.error('Telegram polling error:', error);
    });
  }

  // backend/src/services/telegram.service.ts - Update the sendInvitation method
async sendInvitation(chatId: string, guestName: string, inviteLink: string): Promise<boolean> {
  if (!this.bot || !this.isActive) {
    logger.info('Telegram bot is not active or not initialized')
    return false
  }

  try {
    logger.info(`Attempting to send Telegram message to chatId: ${chatId}`)
    logger.info(`Message for: ${guestName}`)
    logger.info(`Invite link: ${inviteLink}`)
    
    const message = `🎉 Dear ${guestName},\n\nYou're invited to a wedding! 🥂\n\nClick here to view your invitation: ${inviteLink}\n\nPlease RSVP through the link!`
    
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
    
    logger.info('Telegram invitation sent successfully')
    return true
  } catch (error: any) {
    console.error('Error sending Telegram invitation:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    // Common errors:
    if (error.code === 400) {
      console.error('Bad request - check chatId format')
    } else if (error.code === 403) {
      console.error('Bot blocked by user or no permission')
    } else if (error.code === 404) {
      console.error('Chat not found - user might not have started bot')
    }
    
    return false
  }
}

  isBotActive(): boolean {
    return this.isActive;
  }
}

export default new TelegramService();
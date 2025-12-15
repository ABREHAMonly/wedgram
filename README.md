# WedGram - Wedding Invitation Platform

A modern wedding invitation platform with Telegram integration, email notifications, and Cloudinary for image hosting.

## Features

- 👰 **Wedding Management**: Create and manage wedding details
- 📧 **Multi-channel Invitations**: Send via Telegram, Email, or WhatsApp
- ✅ **RSVP System**: Track guest responses
- 🤖 **Telegram Bot**: Automated guest interaction
- 📸 **Image Hosting**: Cloudinary integration for wedding photos
- 🔐 **Secure Authentication**: JWT-based authentication
- 📊 **Admin Dashboard**: Manage users and view statistics

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Cloudinary (free tier)
- **Email**: Gmail SMTP (free tier)
- **Bot**: Telegram Bot API

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MongoDB (Cloud or local)
- Telegram Bot Token
- Gmail Account (for email)
- Cloudinary Account (for images)

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your values.

### 3. Installation
```bash
cd backend
npm install
npm run dev



### 4. Tests

How to Run Tests:
Unit Tests Only:

bash
npm run test:unit
Integration Tests Only:

bash
npm run test:integration
E2E Tests Only:

bash
npm run test:e2e
All Tests:

bash
npm test
Watch Mode (for development):

bash
npm run test:watch
With Coverage Report:

bash
npm run test:coverage
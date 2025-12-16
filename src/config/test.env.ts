// backend/src/config/test.env.ts
export const testEnv = {
  JWT_SECRET: 'test-jwt-secret-key',
  JWT_EXPIRES_IN: '1h',
  NODE_ENV: 'test',
  PORT: '5000',
  BASE_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3000',
  INVITE_BASE_URL: 'http://localhost:3000/invite',
  SMTP_HOST: 'smtp.test.com',
  SMTP_PORT: '587',
  SMTP_USER: 'test@test.com',
  SMTP_PASS: 'testpass',
};
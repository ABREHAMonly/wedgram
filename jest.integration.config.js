// jest.integration.config.js
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.integration.ts'],
  testTimeout: 60000,
  testPathIgnorePatterns: [],
};
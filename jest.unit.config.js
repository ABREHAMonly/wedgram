// jest.unit.config.js
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['<rootDir>/src/__tests__/unit/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.unit.ts'],
  testPathIgnorePatterns: [],
};
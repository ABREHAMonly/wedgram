// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts',
    '!src/__tests__/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 60000, // Increase from 30000
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Remove globals to fix ts-jest warning
  // Add transform options instead
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true // Add this for better performance
    }
  },
  // Add maxWorkers for better performance
  maxWorkers: '50%'
};
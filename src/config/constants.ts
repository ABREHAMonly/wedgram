// backend/src/config/constants.ts
export const Constants = {
  APP_NAME: 'WedGram',
  APP_VERSION: '1.0.0',
  
  JWT: {
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_REGEX: /^.{6,}$/, // Simple regex
  },
  
  INVITE: {
    TOKEN_LENGTH: 32,
    TOKEN_EXPIRY_DAYS: 30,
  }
} as const;

export const ErrorMessages = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User already exists',
  INVITATION_NOT_FOUND: 'Invitation not found',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation failed',
  ACCESS_DENIED: 'Access denied',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
} as const;

export const SuccessMessages = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  INVITATION_SENT: 'Invitation sent successfully',
  RSVP_RECORDED: 'RSVP recorded successfully',
} as const;
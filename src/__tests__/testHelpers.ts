//src\__tests__\testHelpers.ts
export const getFutureDate = (days = 1): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const createTestUserData = () => {
  const tomorrow = getFutureDate(1);
  
  return {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    weddingDate: tomorrow.toISOString(),
    partnerName: 'Test Partner',
    weddingLocation: 'Test Venue',
  };
};

export const createTestInviteData = () => {
  return {
    guests: [
      {
        name: 'Test Guest',
        email: 'guest@example.com',
        telegramUsername: '@testguest',
        invitationMethod: 'telegram',
        plusOneAllowed: true,
      },
    ],
    sendImmediately: false,
  };
};
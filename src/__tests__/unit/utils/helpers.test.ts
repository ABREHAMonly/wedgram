// backend/src/__tests__/unit/utils/helpers.test.ts
import { 
  generateInviteLink, 
  validatePhone,
  paginate 
} from '../../../utils/helpers';

describe('Helpers', () => {
  describe('generateInviteLink', () => {
    it('should generate invite link with token', () => {
      const token = 'testtoken123';
      const link = generateInviteLink(token);
      
      // The function should use INVITE_BASE_URL or FRONTEND_URL
      expect(link).toBe('http://localhost:3000/invite/testtoken123');
    });

    it('should use INVITE_BASE_URL from env if available', () => {
      const originalInviteBaseUrl = process.env.INVITE_BASE_URL;
      process.env.INVITE_BASE_URL = 'https://example.com/invite';
      
      const token = 'testtoken';
      const link = generateInviteLink(token);
      
      expect(link).toBe('https://example.com/invite/testtoken');
      
      process.env.INVITE_BASE_URL = originalInviteBaseUrl;
    });
  });


  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+12345678901')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+441234567890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false); // Too short
      expect(validatePhone('abc')).toBe(false);
      expect(validatePhone('+123')).toBe(false); // Too short
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('+1234567890123456')).toBe(false); // Too long
    });
  });

  describe('paginate', () => {
    const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it('should paginate array correctly', () => {
      const result = paginate(testArray, 1, 3);
      
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
      expect(result.total).toBe(10);
      expect(result.totalPages).toBe(4);
    });

    it('should handle empty array', () => {
      const result = paginate([], 1, 10);
      
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle last page with remaining items', () => {
      const result = paginate(testArray, 4, 3);
      
      expect(result.data).toEqual([10]);
      expect(result.totalPages).toBe(4);
    });

    it('should return empty array for page beyond total', () => {
      const result = paginate(testArray, 5, 3);
      
      expect(result.data).toEqual([]);
    });
  });
});
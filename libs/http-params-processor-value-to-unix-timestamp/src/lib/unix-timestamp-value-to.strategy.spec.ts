import { UnixTimestampValueToStrategy } from './unix-timestamp-value-to.strategy';

describe('UnixTimestampValueToStrategy', () => {
  let strategy: UnixTimestampValueToStrategy;

  beforeEach(() => {
    strategy = new UnixTimestampValueToStrategy();
  });

  describe('canHandle', () => {
    it('should return true for valid Date objects', () => {
      expect(strategy.canHandle(new Date('2024-01-01'))).toBe(true);
    });

    it('should return false for invalid Date objects', () => {
      expect(strategy.canHandle(new Date('invalid'))).toBe(false);
    });

    it('should return false for strings', () => {
      expect(strategy.canHandle('2024-01-01')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(strategy.canHandle(1704067200)).toBe(false);
    });

    it('should return false for null', () => {
      expect(strategy.canHandle(null)).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should convert Date to Unix timestamp string', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = strategy.serializeValue(date);
      
      expect(result).toBe('1704067200');
    });

    it('should truncate milliseconds', () => {
      const date = new Date('2024-01-01T00:00:00.999Z');
      const result = strategy.serializeValue(date);
      
      expect(result).toBe('1704067200');
    });

    it('should handle dates with time', () => {
      const date = new Date('2024-06-15T14:30:45.000Z');
      const result = strategy.serializeValue(date);
      const expected = Math.floor(date.getTime() / 1000).toString();
      
      expect(result).toBe(expected);
    });
  });
});

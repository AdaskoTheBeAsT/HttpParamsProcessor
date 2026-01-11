import { MsTimestampValueToStrategy } from './ms-timestamp-value-to.strategy';

describe('MsTimestampValueToStrategy', () => {
  let strategy: MsTimestampValueToStrategy;

  beforeEach(() => {
    strategy = new MsTimestampValueToStrategy();
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
      expect(strategy.canHandle(1704067200000)).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should convert Date to milliseconds timestamp string', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = strategy.serializeValue(date);

      expect(result).toBe('1704067200000');
    });

    it('should preserve milliseconds', () => {
      const date = new Date('2024-01-01T00:00:00.123Z');
      const result = strategy.serializeValue(date);

      expect(result).toBe('1704067200123');
    });

    it('should handle dates with time', () => {
      const date = new Date('2024-06-15T14:30:45.500Z');
      const result = strategy.serializeValue(date);
      const expected = date.getTime().toString();

      expect(result).toBe(expected);
    });
  });
});

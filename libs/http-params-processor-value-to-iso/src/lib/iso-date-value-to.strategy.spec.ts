import { IsoDateValueToStrategy } from './iso-date-value-to.strategy';

describe('IsoDateValueToStrategy', () => {
  let strategy: IsoDateValueToStrategy;

  beforeEach(() => {
    strategy = new IsoDateValueToStrategy();
  });

  describe('canHandle', () => {
    it('should return true for valid Date objects', () => {
      expect(strategy.canHandle(new Date('2024-01-01'))).toBe(true);
    });

    it('should return false for invalid Date objects', () => {
      expect(strategy.canHandle(new Date('invalid'))).toBe(false);
    });

    it('should return false for strings', () => {
      expect(strategy.canHandle('2024-01-01T00:00:00.000Z')).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should convert Date to ISO 8601 string', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = strategy.serializeValue(date);
      
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should preserve milliseconds', () => {
      const date = new Date('2024-01-01T12:30:45.123Z');
      const result = strategy.serializeValue(date);
      
      expect(result).toBe('2024-01-01T12:30:45.123Z');
    });
  });
});

import { NodaTimeDateValueToStrategy } from './nodatime-date-value-to.strategy';

describe('NodaTimeDateValueToStrategy', () => {
  let strategy: NodaTimeDateValueToStrategy;

  beforeEach(() => {
    strategy = new NodaTimeDateValueToStrategy();
  });

  describe('canHandle', () => {
    it('should return true for valid Date objects', () => {
      expect(strategy.canHandle(new Date('2024-01-01'))).toBe(true);
    });

    it('should return false for invalid Date objects', () => {
      expect(strategy.canHandle(new Date('invalid'))).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should convert Date to ISO 8601 string', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = strategy.serializeValue(date);

      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });
  });
});

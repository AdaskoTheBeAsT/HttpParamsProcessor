import { IsoDateValueToStrategy } from './iso-date-value-to.strategy';

describe('IsoDateValueToStrategy', () => {
  let strategy: IsoDateValueToStrategy;

  beforeEach(() => {
    strategy = new IsoDateValueToStrategy();
  });

  describe('canHandle', () => {
    it('should handle Date objects', () => {
      expect(strategy.canHandle(new Date())).toBe(true);
    });

    it('should not handle invalid dates', () => {
      expect(strategy.canHandle(new Date('invalid'))).toBe(false);
    });

    it('should not handle non-Date values', () => {
      expect(strategy.canHandle('2024-01-01')).toBe(false);
      expect(strategy.canHandle(123456)).toBe(false);
      expect(strategy.canHandle(null)).toBe(false);
      expect(strategy.canHandle(undefined)).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should serialize Date to ISO string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      expect(strategy.serializeValue(date)).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});

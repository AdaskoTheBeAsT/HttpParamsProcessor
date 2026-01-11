import { IsoDurationValueToStrategy } from './iso-duration-value-to.strategy';

describe('IsoDurationValueToStrategy', () => {
  let strategy: IsoDurationValueToStrategy;

  beforeEach(() => {
    strategy = new IsoDurationValueToStrategy();
  });

  describe('canHandle', () => {
    it('should return true for DurationComponents with hours', () => {
      expect(strategy.canHandle({ hours: 1 })).toBe(true);
    });

    it('should return true for DurationComponents with multiple fields', () => {
      expect(strategy.canHandle({ years: 1, months: 2, days: 3 })).toBe(true);
    });

    it('should return false for null', () => {
      expect(strategy.canHandle(null)).toBe(false);
    });

    it('should return false for Date objects', () => {
      expect(strategy.canHandle(new Date())).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(strategy.canHandle({})).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should format hours and minutes', () => {
      const result = strategy.serializeValue({ hours: 1, minutes: 30 });
      expect(result).toBe('PT1H30M');
    });

    it('should format days', () => {
      const result = strategy.serializeValue({ days: 5 });
      expect(result).toBe('P5D');
    });

    it('should format years, months, and days', () => {
      const result = strategy.serializeValue({ years: 1, months: 2, days: 3 });
      expect(result).toBe('P1Y2M3D');
    });

    it('should format full duration', () => {
      const result = strategy.serializeValue({
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
      });
      expect(result).toBe('P1Y2M3DT4H5M6S');
    });

    it('should handle milliseconds as fractional seconds', () => {
      const result = strategy.serializeValue({ seconds: 1, milliseconds: 500 });
      expect(result).toBe('PT1.5S');
    });

    it('should return PT0S for empty duration', () => {
      const result = strategy.serializeValue({});
      expect(result).toBe('PT0S');
    });

    it('should handle weeks', () => {
      const result = strategy.serializeValue({ weeks: 2 });
      expect(result).toBe('P2W');
    });
  });
});

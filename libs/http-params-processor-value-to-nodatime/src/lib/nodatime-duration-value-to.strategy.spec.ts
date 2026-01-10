import { NodaTimeDurationValueToStrategy } from './nodatime-duration-value-to.strategy';

describe('NodaTimeDurationValueToStrategy', () => {
  let strategy: NodaTimeDurationValueToStrategy;

  beforeEach(() => {
    strategy = new NodaTimeDurationValueToStrategy();
  });

  describe('canHandle', () => {
    it('should return true for DurationComponents with hours', () => {
      expect(strategy.canHandle({ hours: 1 })).toBe(true);
    });

    it('should return false for PeriodComponents without time', () => {
      expect(strategy.canHandle({ years: 1, months: 2 })).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should format hours and minutes', () => {
      const result = strategy.serializeValue({ hours: 1, minutes: 30 });
      expect(result).toBe('PT1H30M');
    });

    it('should convert days to hours', () => {
      const result = strategy.serializeValue({ days: 1, hours: 2 });
      expect(result).toBe('PT26H');
    });

    it('should return PT0S for empty duration', () => {
      const result = strategy.serializeValue({});
      expect(result).toBe('PT0S');
    });

    it('should handle milliseconds as fractional seconds', () => {
      const result = strategy.serializeValue({ seconds: 1, milliseconds: 500 });
      expect(result).toBe('PT1.5S');
    });
  });
});

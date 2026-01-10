import { NodaTimePeriodValueToStrategy } from './nodatime-period-value-to.strategy';

describe('NodaTimePeriodValueToStrategy', () => {
  let strategy: NodaTimePeriodValueToStrategy;

  beforeEach(() => {
    strategy = new NodaTimePeriodValueToStrategy();
  });

  describe('canHandle', () => {
    it('should return true for PeriodComponents', () => {
      expect(strategy.canHandle({ years: 1, months: 2 })).toBe(true);
    });

    it('should return false for DurationComponents with time fields', () => {
      expect(strategy.canHandle({ hours: 1 })).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should format years and months', () => {
      const result = strategy.serializeValue({ years: 1, months: 6 });
      expect(result).toBe('P1Y6M');
    });

    it('should format weeks', () => {
      const result = strategy.serializeValue({ weeks: 2 });
      expect(result).toBe('P2W');
    });

    it('should return P0D for empty period', () => {
      const result = strategy.serializeValue({});
      expect(result).toBe('P0D');
    });
  });
});

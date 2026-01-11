import { IsoPeriodValueToStrategy } from './iso-period-value-to.strategy';

describe('IsoPeriodValueToStrategy', () => {
  let strategy: IsoPeriodValueToStrategy;

  beforeEach(() => {
    strategy = new IsoPeriodValueToStrategy();
  });

  describe('canHandle', () => {
    it('should return true for PeriodComponents', () => {
      expect(strategy.canHandle({ years: 1, months: 2 })).toBe(true);
    });

    it('should return false for DurationComponents with time fields', () => {
      expect(strategy.canHandle({ hours: 1 })).toBe(false);
    });

    it('should return false for null', () => {
      expect(strategy.canHandle(null)).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should format years and months', () => {
      const result = strategy.serializeValue({ years: 1, months: 6 });
      expect(result).toBe('P1Y6M');
    });

    it('should format days only', () => {
      const result = strategy.serializeValue({ days: 10 });
      expect(result).toBe('P10D');
    });

    it('should format weeks', () => {
      const result = strategy.serializeValue({ weeks: 2 });
      expect(result).toBe('P2W');
    });

    it('should return P0D for empty period', () => {
      const result = strategy.serializeValue({});
      expect(result).toBe('P0D');
    });

    it('should format full period', () => {
      const result = strategy.serializeValue({
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
      });
      expect(result).toBe('P1Y2M3W4D');
    });
  });
});

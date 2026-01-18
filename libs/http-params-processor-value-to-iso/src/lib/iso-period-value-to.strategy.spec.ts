import { IsoPeriodValueToStrategy } from './iso-period-value-to.strategy';

describe('IsoPeriodValueToStrategy', () => {
  let strategy: IsoPeriodValueToStrategy;

  beforeEach(() => {
    strategy = new IsoPeriodValueToStrategy();
  });

  describe('canHandle', () => {
    it('should handle period components', () => {
      expect(strategy.canHandle({ years: 1 })).toBe(true);
      expect(strategy.canHandle({ months: 6 })).toBe(true);
      expect(strategy.canHandle({ weeks: 2 })).toBe(true);
      expect(strategy.canHandle({ days: 10 })).toBe(true);
    });

    it('should not handle values with time components', () => {
      expect(strategy.canHandle({ hours: 1 })).toBe(false);
      expect(strategy.canHandle({ minutes: 30 })).toBe(false);
    });

    it('should not handle non-period values', () => {
      expect(strategy.canHandle(null)).toBe(false);
      expect(strategy.canHandle('P1Y')).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should serialize years', () => {
      expect(strategy.serializeValue({ years: 2 })).toBe('P2Y');
    });

    it('should serialize months', () => {
      expect(strategy.serializeValue({ months: 6 })).toBe('P6M');
    });

    it('should serialize weeks', () => {
      expect(strategy.serializeValue({ weeks: 3 })).toBe('P3W');
    });

    it('should serialize days', () => {
      expect(strategy.serializeValue({ days: 15 })).toBe('P15D');
    });

    it('should serialize combined period', () => {
      expect(strategy.serializeValue({ years: 1, months: 6, days: 15 }))
        .toBe('P1Y6M15D');
    });

    it('should return P0D for empty period', () => {
      expect(strategy.serializeValue({})).toBe('P0D');
    });
  });
});

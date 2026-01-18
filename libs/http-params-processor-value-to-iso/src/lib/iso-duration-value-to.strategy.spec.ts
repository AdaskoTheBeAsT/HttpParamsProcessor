import { IsoDurationValueToStrategy } from './iso-duration-value-to.strategy';

describe('IsoDurationValueToStrategy', () => {
  let strategy: IsoDurationValueToStrategy;

  beforeEach(() => {
    strategy = new IsoDurationValueToStrategy();
  });

  describe('canHandle', () => {
    it('should handle duration components', () => {
      expect(strategy.canHandle({ hours: 1, minutes: 30 })).toBe(true);
      expect(strategy.canHandle({ days: 5 })).toBe(true);
      expect(strategy.canHandle({ years: 1, months: 6 })).toBe(true);
    });

    it('should not handle non-duration values', () => {
      expect(strategy.canHandle(null)).toBe(false);
      expect(strategy.canHandle('PT1H')).toBe(false);
      expect(strategy.canHandle(3600)).toBe(false);
    });
  });

  describe('serializeValue', () => {
    it('should serialize time-only duration', () => {
      expect(strategy.serializeValue({ hours: 1, minutes: 30, seconds: 45 }))
        .toBe('PT1H30M45S');
    });

    it('should serialize date-only duration', () => {
      expect(strategy.serializeValue({ years: 1, months: 6, days: 15 }))
        .toBe('P1Y6M15D');
    });

    it('should serialize full duration', () => {
      expect(strategy.serializeValue({ 
        years: 1, 
        months: 2, 
        days: 3, 
        hours: 4, 
        minutes: 5, 
        seconds: 6 
      })).toBe('P1Y2M3DT4H5M6S');
    });

    it('should handle milliseconds', () => {
      expect(strategy.serializeValue({ seconds: 1, milliseconds: 500 }))
        .toBe('PT1.5S');
    });

    it('should return PT0S for empty duration', () => {
      expect(strategy.serializeValue({})).toBe('PT0S');
    });
  });
});

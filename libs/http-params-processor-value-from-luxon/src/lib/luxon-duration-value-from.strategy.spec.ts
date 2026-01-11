import { DateTime, Duration } from 'luxon';

import { LuxonDurationValueFromStrategy } from './luxon-duration-value-from.strategy';

describe('LuxonDurationValueFromStrategy', () => {
  let strategy: LuxonDurationValueFromStrategy;

  beforeEach(() => {
    strategy = new LuxonDurationValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for Luxon Duration objects', () => {
      expect(strategy.canHandle(Duration.fromObject({ hours: 1 }))).toBe(true);
    });

    it('should return false for Luxon DateTime objects', () => {
      expect(strategy.canHandle(DateTime.now())).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert duration with hours and minutes', () => {
      const dur = Duration.fromObject({ hours: 1, minutes: 30 });
      const result = strategy.normalizeValue(dur);

      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
    });

    it('should convert duration with all components', () => {
      const dur = Duration.fromObject({
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
        milliseconds: 7,
      });
      const result = strategy.normalizeValue(dur);

      expect(result.years).toBe(1);
      expect(result.months).toBe(2);
      expect(result.days).toBe(3);
      expect(result.hours).toBe(4);
      expect(result.minutes).toBe(5);
      expect(result.seconds).toBe(6);
      expect(result.milliseconds).toBe(7);
    });
  });
});

import { Period } from '@js-joda/core';

import { JsJodaPeriodValueFromStrategy } from './js-joda-period-value-from.strategy';

describe('JsJodaPeriodValueFromStrategy', () => {
  let strategy: JsJodaPeriodValueFromStrategy;

  beforeEach(() => {
    strategy = new JsJodaPeriodValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for Period', () => {
      expect(strategy.canHandle(Period.ofYears(1))).toBe(true);
    });

    it('should return false for number', () => {
      expect(strategy.canHandle(365)).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert period of years', () => {
      const period = Period.ofYears(2);
      const result = strategy.normalizeValue(period);

      expect(result.years).toBe(2);
    });

    it('should convert period of months', () => {
      const period = Period.ofMonths(6);
      const result = strategy.normalizeValue(period);

      expect(result.months).toBe(6);
    });

    it('should convert complex period', () => {
      const period = Period.of(1, 2, 3);
      const result = strategy.normalizeValue(period);

      expect(result.years).toBe(1);
      expect(result.months).toBe(2);
      expect(result.days).toBe(3);
    });
  });
});

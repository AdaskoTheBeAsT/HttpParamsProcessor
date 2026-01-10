import { Duration } from '@js-joda/core';
import { JsJodaDurationValueFromStrategy } from './js-joda-duration-value-from.strategy';

describe('JsJodaDurationValueFromStrategy', () => {
  let strategy: JsJodaDurationValueFromStrategy;

  beforeEach(() => {
    strategy = new JsJodaDurationValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for Duration', () => {
      expect(strategy.canHandle(Duration.ofHours(1))).toBe(true);
    });

    it('should return false for number', () => {
      expect(strategy.canHandle(3600)).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert duration of hours', () => {
      const dur = Duration.ofHours(2);
      const result = strategy.normalizeValue(dur);
      
      expect(result.hours).toBe(2);
    });

    it('should convert duration of minutes', () => {
      const dur = Duration.ofMinutes(90);
      const result = strategy.normalizeValue(dur);
      
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
    });

    it('should convert complex duration', () => {
      const dur = Duration.ofHours(2).plusMinutes(30).plusSeconds(45);
      const result = strategy.normalizeValue(dur);
      
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(45);
    });
  });
});

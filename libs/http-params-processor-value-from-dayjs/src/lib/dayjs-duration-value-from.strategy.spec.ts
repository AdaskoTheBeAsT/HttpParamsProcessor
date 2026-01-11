import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';

import { DayjsDurationValueFromStrategy } from './dayjs-duration-value-from.strategy';

dayjs.extend(durationPlugin);

describe('DayjsDurationValueFromStrategy', () => {
  let strategy: DayjsDurationValueFromStrategy;

  beforeEach(() => {
    strategy = new DayjsDurationValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for dayjs duration objects', () => {
      expect(strategy.canHandle(dayjs.duration({ hours: 1 }))).toBe(true);
    });

    it('should return false for dayjs date objects', () => {
      expect(strategy.canHandle(dayjs('2024-01-01'))).toBe(false);
    });

    it('should return false for number', () => {
      expect(strategy.canHandle(3600000)).toBe(false);
    });

    it('should return false for null', () => {
      expect(strategy.canHandle(null)).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert duration with hours and minutes', () => {
      const dur = dayjs.duration({ hours: 1, minutes: 30 });
      const result = strategy.normalizeValue(dur);

      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
    });

    it('should convert duration with days', () => {
      const dur = dayjs.duration({ days: 5, hours: 2 });
      const result = strategy.normalizeValue(dur);

      expect(result.days).toBe(5);
      expect(result.hours).toBe(2);
    });

    it('should convert duration with all components', () => {
      const dur = dayjs.duration({
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

    it('should return undefined for zero values', () => {
      const dur = dayjs.duration({ hours: 1 });
      const result = strategy.normalizeValue(dur);

      expect(result.hours).toBe(1);
      expect(result.days).toBeUndefined();
      expect(result.minutes).toBeUndefined();
    });
  });
});

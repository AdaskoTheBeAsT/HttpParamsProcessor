import dayjs from 'dayjs';

import { DayjsDateValueFromStrategy } from './dayjs-date-value-from.strategy';

describe('DayjsDateValueFromStrategy', () => {
  let strategy: DayjsDateValueFromStrategy;

  beforeEach(() => {
    strategy = new DayjsDateValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for dayjs objects', () => {
      expect(strategy.canHandle(dayjs('2024-01-01'))).toBe(true);
    });

    it('should return false for native Date', () => {
      expect(strategy.canHandle(new Date())).toBe(false);
    });

    it('should return false for string', () => {
      expect(strategy.canHandle('2024-01-01')).toBe(false);
    });

    it('should return false for null', () => {
      expect(strategy.canHandle(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(strategy.canHandle(undefined)).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert dayjs to Date', () => {
      const dayjsDate = dayjs('2024-01-15T10:30:00.000Z');
      const result = strategy.normalizeValue(dayjsDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should preserve time information', () => {
      const dayjsDate = dayjs('2024-06-15T14:00:00.000Z');
      const result = strategy.normalizeValue(dayjsDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(dayjsDate.valueOf());
    });
  });
});

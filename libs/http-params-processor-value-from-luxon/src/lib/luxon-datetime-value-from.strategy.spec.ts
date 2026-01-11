import { DateTime } from 'luxon';

import { LuxonDateTimeValueFromStrategy } from './luxon-datetime-value-from.strategy';

describe('LuxonDateTimeValueFromStrategy', () => {
  let strategy: LuxonDateTimeValueFromStrategy;

  beforeEach(() => {
    strategy = new LuxonDateTimeValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for Luxon DateTime objects', () => {
      expect(strategy.canHandle(DateTime.fromISO('2024-01-01'))).toBe(true);
    });

    it('should return false for native Date', () => {
      expect(strategy.canHandle(new Date())).toBe(false);
    });

    it('should return false for string', () => {
      expect(strategy.canHandle('2024-01-01')).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert DateTime to Date', () => {
      const luxonDate = DateTime.fromISO('2024-01-15T10:30:00.000Z', {
        zone: 'utc',
      });
      const result = strategy.normalizeValue(luxonDate);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});

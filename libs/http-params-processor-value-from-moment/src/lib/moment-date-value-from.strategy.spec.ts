import * as moment from 'moment';
import { MomentDateValueFromStrategy } from './moment-date-value-from.strategy';

describe('MomentDateValueFromStrategy', () => {
  let strategy: MomentDateValueFromStrategy;

  beforeEach(() => {
    strategy = new MomentDateValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for moment objects', () => {
      expect(strategy.canHandle(moment('2024-01-01'))).toBe(true);
    });

    it('should return false for native Date', () => {
      expect(strategy.canHandle(new Date())).toBe(false);
    });

    it('should return false for string', () => {
      expect(strategy.canHandle('2024-01-01')).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert moment to Date', () => {
      const momentDate = moment.utc('2024-01-15T10:30:00.000Z');
      const result = strategy.normalizeValue(momentDate);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});

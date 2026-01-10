import * as moment from 'moment';
import { MomentDurationValueFromStrategy } from './moment-duration-value-from.strategy';

describe('MomentDurationValueFromStrategy', () => {
  let strategy: MomentDurationValueFromStrategy;

  beforeEach(() => {
    strategy = new MomentDurationValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for moment duration objects', () => {
      expect(strategy.canHandle(moment.duration({ hours: 1 }))).toBe(true);
    });

    it('should return false for moment date objects', () => {
      expect(strategy.canHandle(moment('2024-01-01'))).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert duration with hours and minutes', () => {
      const dur = moment.duration({ hours: 1, minutes: 30 });
      const result = strategy.normalizeValue(dur);
      
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
    });

    it('should convert duration with all components', () => {
      const dur = moment.duration({
        years: 1,
        months: 2,
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
        milliseconds: 7
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

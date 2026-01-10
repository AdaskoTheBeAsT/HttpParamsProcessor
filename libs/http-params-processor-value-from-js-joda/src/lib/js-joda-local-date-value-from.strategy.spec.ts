import { LocalDate, LocalDateTime } from '@js-joda/core';
import { JsJodaLocalDateValueFromStrategy } from './js-joda-local-date-value-from.strategy';

describe('JsJodaLocalDateValueFromStrategy', () => {
  let strategy: JsJodaLocalDateValueFromStrategy;

  beforeEach(() => {
    strategy = new JsJodaLocalDateValueFromStrategy();
  });

  describe('canHandle', () => {
    it('should return true for LocalDate', () => {
      expect(strategy.canHandle(LocalDate.of(2024, 1, 15))).toBe(true);
    });

    it('should return true for LocalDateTime', () => {
      expect(strategy.canHandle(LocalDateTime.of(2024, 1, 15, 10, 30))).toBe(true);
    });

    it('should return false for native Date', () => {
      expect(strategy.canHandle(new Date())).toBe(false);
    });

    it('should return false for string', () => {
      expect(strategy.canHandle('2024-01-01')).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert LocalDate to Date', () => {
      const jodaDate = LocalDate.of(2024, 1, 15);
      const result = strategy.normalizeValue(jodaDate);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January = 0
      expect(result.getDate()).toBe(15);
    });

    it('should convert LocalDateTime to Date', () => {
      const jodaDateTime = LocalDateTime.of(2024, 1, 15, 10, 30, 45);
      const result = strategy.normalizeValue(jodaDateTime);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(10);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });
  });
});

import Decimal from 'decimal.js';

import { DecimalValueFromStrategy } from './decimal-value-from.strategy';

describe('DecimalValueFromStrategy', () => {
  const strategy = new DecimalValueFromStrategy();

  describe('canHandle', () => {
    it('should handle Decimal instances', () => {
      expect(strategy.canHandle(new Decimal('123.45'))).toBe(true);
      expect(strategy.canHandle(new Decimal(0))).toBe(true);
    });

    it('should handle Decimal instances from a clone', () => {
      const Cloned = Decimal.clone({ precision: 40 });

      expect(strategy.canHandle(new Cloned('123.45'))).toBe(true);
    });

    it('should not handle non finite decimals', () => {
      expect(strategy.canHandle(new Decimal(NaN))).toBe(false);
      expect(strategy.canHandle(new Decimal(Infinity))).toBe(false);
    });

    it('should not handle decimal shaped strings or numbers', () => {
      expect(strategy.canHandle('123.45')).toBe(false);
      expect(strategy.canHandle(123.45)).toBe(false);
      expect(strategy.canHandle(null)).toBe(false);
      expect(strategy.canHandle({ decimal: '1' })).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should keep full precision', () => {
      const text = '12345678901234567890.1234567890123456789';

      expect(strategy.normalizeValue(new Decimal(text))).toEqual({
        decimal: text,
      });
    });

    it('should normalize the input notation', () => {
      expect(strategy.normalizeValue(new Decimal('+42'))).toEqual({
        decimal: '42',
      });
      expect(strategy.normalizeValue(new Decimal('.5'))).toEqual({
        decimal: '0.5',
      });
    });

    it('should never use exponential notation', () => {
      expect(strategy.normalizeValue(new Decimal('1.25e+8'))).toEqual({
        decimal: '125000000',
      });
      expect(strategy.normalizeValue(new Decimal('1e-7'))).toEqual({
        decimal: '0.0000001',
      });
    });

    it('should keep the sign of negative values', () => {
      expect(strategy.normalizeValue(new Decimal('-0.001'))).toEqual({
        decimal: '-0.001',
      });
    });
  });
});

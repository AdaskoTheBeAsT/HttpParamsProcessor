import Decimal from 'decimal.js';

import { DecimalExponentialValueToStrategy } from './decimal-exponential-value-to.strategy';
import { DecimalFixedValueToStrategy } from './decimal-fixed-value-to.strategy';
import { DecimalNumberValueToStrategy } from './decimal-number-value-to.strategy';
import { DecimalStringValueToStrategy } from './decimal-string-value-to.strategy';

describe('Decimal value-to strategies', () => {
  describe('DecimalStringValueToStrategy', () => {
    const strategy = new DecimalStringValueToStrategy();

    it('should serialize losslessly', () => {
      const text = '12345678901234567890.1234567890123456789';

      expect(strategy.serializeValue({ decimal: text })).toBe(text);
    });

    it('should handle only DecimalComponents', () => {
      expect(strategy.canHandle({ decimal: '-0.5' })).toBe(true);
      expect(strategy.canHandle({ decimal: '1.25e+8' })).toBe(false);
      expect(strategy.canHandle({ decimal: 'abc' })).toBe(false);
      expect(strategy.canHandle('1.5')).toBe(false);
      expect(strategy.canHandle(null)).toBe(false);
    });
  });

  describe('DecimalFixedValueToStrategy', () => {
    it('should pad to two decimal places by default', () => {
      expect(
        new DecimalFixedValueToStrategy().serializeValue({ decimal: '12.5' }),
      ).toBe('12.50');
    });

    it('should round half up by default', () => {
      const strategy = new DecimalFixedValueToStrategy(2);

      expect(strategy.serializeValue({ decimal: '1.005' })).toBe('1.01');
      expect(strategy.serializeValue({ decimal: '1.004' })).toBe('1.00');
    });

    it('should support a custom rounding mode', () => {
      const strategy = new DecimalFixedValueToStrategy(0, Decimal.ROUND_DOWN);

      expect(strategy.serializeValue({ decimal: '1.9' })).toBe('1');
    });
  });

  describe('DecimalNumberValueToStrategy', () => {
    const strategy = new DecimalNumberValueToStrategy();

    it('should serialize as a number literal', () => {
      expect(strategy.serializeValue({ decimal: '12.50' })).toBe('12.5');
      expect(strategy.serializeValue({ decimal: '-0.001' })).toBe('-0.001');
    });

    it('should throw when the value exceeds the double range', () => {
      const huge = new Decimal('1e400').toFixed();

      expect(() => strategy.serializeValue({ decimal: huge })).toThrow(
        'cannot be represented as a finite number',
      );
    });
  });

  describe('DecimalExponentialValueToStrategy', () => {
    it('should serialize in exponential notation', () => {
      expect(
        new DecimalExponentialValueToStrategy().serializeValue({
          decimal: '125000000',
        }),
      ).toBe('1.25e+8');
    });

    it('should honor significant digits', () => {
      expect(
        new DecimalExponentialValueToStrategy(2).serializeValue({
          decimal: '125400000',
        }),
      ).toBe('1.25e+8');
    });
  });
});

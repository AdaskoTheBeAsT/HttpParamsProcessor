import {
  DecimalComponents,
  IValueFromStrategy,
} from '@adaskothebeast/http-params-processor-core';
import Decimal from 'decimal.js';

/**
 * Normalizes decimal.js values into DecimalComponents.
 *
 * The intermediate form is a lossless, non-exponential decimal literal, so no
 * precision is lost and the paired value-to strategy decides the wire format.
 * Only real Decimal instances are handled - decimal shaped strings are left
 * untouched, since `price`, `phone` and `postalCode` look identical.
 */
export class DecimalValueFromStrategy implements IValueFromStrategy<
  Decimal,
  DecimalComponents
> {
  normalizeValue(value: Decimal): DecimalComponents {
    return { decimal: value.toFixed() };
  }

  canHandle(value: unknown): value is Decimal {
    return Decimal.isDecimal(value) && (value as Decimal).isFinite();
  }
}

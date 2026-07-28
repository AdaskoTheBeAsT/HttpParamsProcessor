import {
  DecimalComponents,
  IValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';
import Decimal from 'decimal.js';

import { isDecimalComponents } from './decimal-components.guard';

/**
 * Serializes decimals with a fixed number of decimal places, e.g. money.
 * Example: `new DecimalFixedValueToStrategy(2)` renders `12.5` as `12.50`.
 */
export class DecimalFixedValueToStrategy implements IValueToStrategy<DecimalComponents> {
  constructor(
    private readonly decimalPlaces = 2,
    private readonly rounding: Decimal.Rounding = Decimal.ROUND_HALF_UP,
  ) {}

  serializeValue(value: DecimalComponents): string {
    return new Decimal(value.decimal).toFixed(this.decimalPlaces, this.rounding);
  }

  canHandle(value: unknown): value is DecimalComponents {
    return isDecimalComponents(value);
  }
}

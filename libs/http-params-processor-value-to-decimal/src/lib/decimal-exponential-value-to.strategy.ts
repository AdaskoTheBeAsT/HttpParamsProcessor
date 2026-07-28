import {
  DecimalComponents,
  IValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';
import Decimal from 'decimal.js';

import { isDecimalComponents } from './decimal-components.guard';

/**
 * Serializes decimals in exponential notation, for backends that expect
 * scientific format. Example: `1.2345e+8`
 */
export class DecimalExponentialValueToStrategy implements IValueToStrategy<DecimalComponents> {
  constructor(private readonly significantDigits?: number) {}

  serializeValue(value: DecimalComponents): string {
    const decimal = new Decimal(value.decimal);
    return this.significantDigits === undefined
      ? decimal.toExponential()
      : decimal.toExponential(this.significantDigits);
  }

  canHandle(value: unknown): value is DecimalComponents {
    return isDecimalComponents(value);
  }
}

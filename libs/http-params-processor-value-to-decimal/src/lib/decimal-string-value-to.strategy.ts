import {
  DecimalComponents,
  IValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';

import { isDecimalComponents } from './decimal-components.guard';

/**
 * Serializes decimals losslessly as a plain (never exponential) literal.
 * This is the format ASP.NET Core, Rails and Spring decimal binders expect.
 * Example: `12345678901234567890.1234567890123456789`
 */
export class DecimalStringValueToStrategy implements IValueToStrategy<DecimalComponents> {
  serializeValue(value: DecimalComponents): string {
    return value.decimal;
  }

  canHandle(value: unknown): value is DecimalComponents {
    return isDecimalComponents(value);
  }
}

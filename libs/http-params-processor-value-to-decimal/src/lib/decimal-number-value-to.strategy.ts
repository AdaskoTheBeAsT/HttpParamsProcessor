import {
  DecimalComponents,
  IValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';
import Decimal from 'decimal.js';

import { isDecimalComponents } from './decimal-components.guard';

/**
 * Serializes decimals as a JavaScript number literal, mirroring the
 * `wireType: 'number'` contract. Values outside the double range are rejected.
 */
export class DecimalNumberValueToStrategy implements IValueToStrategy<DecimalComponents> {
  serializeValue(value: DecimalComponents): string {
    const asNumber = new Decimal(value.decimal).toNumber();
    if (!Number.isFinite(asNumber)) {
      throw new Error(
        `Decimal '${value.decimal}' cannot be represented as a finite number`,
      );
    }
    return String(asNumber);
  }

  canHandle(value: unknown): value is DecimalComponents {
    return isDecimalComponents(value);
  }
}

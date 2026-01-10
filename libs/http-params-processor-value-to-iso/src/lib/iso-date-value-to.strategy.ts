import { IValueToStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy to serialize Date objects to ISO 8601 format.
 */
export class IsoDateValueToStrategy implements IValueToStrategy<Date> {
  serializeValue(value: Date): string {
    return value.toISOString();
  }

  canHandle(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }
}

import { IValueToStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy to serialize Date objects to Unix timestamp (seconds since epoch).
 */
export class UnixTimestampValueToStrategy implements IValueToStrategy<Date> {
  serializeValue(value: Date): string {
    return Math.floor(value.getTime() / 1000).toString();
  }

  canHandle(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }
}

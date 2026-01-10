import { IValueToStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy to serialize Date objects to milliseconds timestamp.
 */
export class MsTimestampValueToStrategy implements IValueToStrategy<Date> {
  serializeValue(value: Date): string {
    return value.getTime().toString();
  }

  canHandle(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }
}

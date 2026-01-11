import { IValueToStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy to serialize Date objects to NodaTime-compatible ISO format.
 * Uses the same ISO 8601 format that NodaTime's Instant.FromDateTimeOffset parses.
 */
export class NodaTimeDateValueToStrategy implements IValueToStrategy<Date> {
  serializeValue(value: Date): string {
    return value.toISOString();
  }

  canHandle(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }
}

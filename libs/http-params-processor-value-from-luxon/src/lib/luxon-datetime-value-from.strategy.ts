import { IValueFromStrategy } from '@adaskothebeast/http-params-processor-core';
import { DateTime } from 'luxon';

/**
 * Strategy to normalize Luxon DateTime objects to native JavaScript Date.
 */
export class LuxonDateTimeValueFromStrategy implements IValueFromStrategy<
  DateTime,
  Date
> {
  normalizeValue(value: DateTime): Date {
    return value.toJSDate();
  }

  canHandle(value: unknown): value is DateTime {
    return DateTime.isDateTime(value);
  }
}

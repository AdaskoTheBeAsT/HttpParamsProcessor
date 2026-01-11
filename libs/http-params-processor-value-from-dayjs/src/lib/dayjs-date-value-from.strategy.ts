import { IValueFromStrategy } from '@adaskothebeast/http-params-processor-core';
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';

/**
 * Strategy to normalize Dayjs date objects to native JavaScript Date.
 */
export class DayjsDateValueFromStrategy implements IValueFromStrategy<
  Dayjs,
  Date
> {
  normalizeValue(value: Dayjs): Date {
    return value.toDate();
  }

  canHandle(value: unknown): value is Dayjs {
    return dayjs.isDayjs(value);
  }
}

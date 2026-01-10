import { IValueFromStrategy, DurationComponents } from '@adaskothebeast/http-params-processor-core';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import { Duration } from 'dayjs/plugin/duration';

dayjs.extend(durationPlugin);

/**
 * Strategy to normalize Dayjs Duration objects to DurationComponents.
 */
export class DayjsDurationValueFromStrategy implements IValueFromStrategy<Duration, DurationComponents> {
  normalizeValue(value: Duration): DurationComponents {
    return {
      years: value.years() || undefined,
      months: value.months() || undefined,
      days: value.days() || undefined,
      hours: value.hours() || undefined,
      minutes: value.minutes() || undefined,
      seconds: value.seconds() || undefined,
      milliseconds: value.milliseconds() || undefined,
    };
  }

  canHandle(value: unknown): value is Duration {
    return dayjs.isDuration(value);
  }
}

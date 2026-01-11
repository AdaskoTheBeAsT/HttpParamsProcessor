import {
  DurationComponents,
  IValueFromStrategy,
} from '@adaskothebeast/http-params-processor-core';
import { Duration } from 'luxon';

/**
 * Strategy to normalize Luxon Duration objects to DurationComponents.
 */
export class LuxonDurationValueFromStrategy implements IValueFromStrategy<
  Duration,
  DurationComponents
> {
  normalizeValue(value: Duration): DurationComponents {
    const obj = value.toObject();
    return {
      years: obj.years || undefined,
      months: obj.months || undefined,
      weeks: obj.weeks || undefined,
      days: obj.days || undefined,
      hours: obj.hours || undefined,
      minutes: obj.minutes || undefined,
      seconds: obj.seconds || undefined,
      milliseconds: obj.milliseconds || undefined,
    };
  }

  canHandle(value: unknown): value is Duration {
    return Duration.isDuration(value);
  }
}

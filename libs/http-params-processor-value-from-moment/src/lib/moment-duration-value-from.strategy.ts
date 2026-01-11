import {
  DurationComponents,
  IValueFromStrategy,
} from '@adaskothebeast/http-params-processor-core';
import * as moment from 'moment';

type MomentDuration = moment.Duration;

/**
 * Strategy to normalize Moment Duration objects to DurationComponents.
 */
export class MomentDurationValueFromStrategy implements IValueFromStrategy<
  MomentDuration,
  DurationComponents
> {
  normalizeValue(value: MomentDuration): DurationComponents {
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

  canHandle(value: unknown): value is MomentDuration {
    return moment.isDuration(value);
  }
}

import {
  DurationComponents,
  IValueFromStrategy,
} from '@adaskothebeast/http-params-processor-core';
import { Duration } from '@js-joda/core';

/**
 * Strategy to normalize js-joda Duration objects to DurationComponents.
 */
export class JsJodaDurationValueFromStrategy implements IValueFromStrategy<
  Duration,
  DurationComponents
> {
  normalizeValue(value: Duration): DurationComponents {
    const totalSeconds = value.seconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const nanos = value.nano();
    const milliseconds = Math.floor(nanos / 1000000);

    return {
      hours: hours || undefined,
      minutes: minutes || undefined,
      seconds: seconds || undefined,
      milliseconds: milliseconds || undefined,
    };
  }

  canHandle(value: unknown): value is Duration {
    return value instanceof Duration;
  }
}

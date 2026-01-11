import {
  IValueFromStrategy,
  PeriodComponents,
} from '@adaskothebeast/http-params-processor-core';
import { Period } from '@js-joda/core';

/**
 * Strategy to normalize js-joda Period objects to PeriodComponents.
 */
export class JsJodaPeriodValueFromStrategy implements IValueFromStrategy<
  Period,
  PeriodComponents
> {
  normalizeValue(value: Period): PeriodComponents {
    return {
      years: value.years() || undefined,
      months: value.months() || undefined,
      days: value.days() || undefined,
    };
  }

  canHandle(value: unknown): value is Period {
    return value instanceof Period;
  }
}

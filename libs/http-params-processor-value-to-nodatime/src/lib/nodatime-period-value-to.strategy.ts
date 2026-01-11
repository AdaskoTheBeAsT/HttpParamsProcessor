import {
  IValueToStrategy,
  PeriodComponents,
} from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy to serialize PeriodComponents to NodaTime Period format.
 * NodaTime Period represents calendar-based amounts (years, months, weeks, days).
 */
export class NodaTimePeriodValueToStrategy implements IValueToStrategy<PeriodComponents> {
  serializeValue(value: PeriodComponents): string {
    let result = 'P';

    if (value.years) result += `${value.years}Y`;
    if (value.months) result += `${value.months}M`;
    if (value.weeks) result += `${value.weeks}W`;
    if (value.days) result += `${value.days}D`;

    return result === 'P' ? 'P0D' : result;
  }

  canHandle(value: unknown): value is PeriodComponents {
    if (value === null || typeof value !== 'object') {
      return false;
    }
    const obj = value as Record<string, unknown>;
    const validKeys = new Set(['years', 'months', 'weeks', 'days']);
    const hasOnlyPeriodKeys = Object.keys(obj).every(
      (key) => validKeys.has(key) || obj[key] === undefined,
    );
    return (
      hasOnlyPeriodKeys &&
      Object.keys(obj).some(
        (key) => validKeys.has(key) && typeof obj[key] === 'number',
      )
    );
  }
}

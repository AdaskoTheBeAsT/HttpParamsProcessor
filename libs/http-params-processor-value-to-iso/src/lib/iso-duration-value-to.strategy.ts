import {
  DurationComponents,
  IValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy to serialize DurationComponents to ISO 8601 duration format.
 * Format: P[n]Y[n]M[n]DT[n]H[n]M[n]S
 */
export class IsoDurationValueToStrategy implements IValueToStrategy<DurationComponents> {
  serializeValue(value: DurationComponents): string {
    const datePart = this.buildDatePart(value);
    const timePart = this.buildTimePart(value);

    if (!datePart && !timePart) {
      return 'PT0S';
    }

    return `P${datePart}${timePart ? 'T' + timePart : ''}`;
  }

  canHandle(value: unknown): value is DurationComponents {
    if (value === null || typeof value !== 'object') {
      return false;
    }
    const obj = value as Record<string, unknown>;
    const validKeys = new Set([
      'years',
      'months',
      'weeks',
      'days',
      'hours',
      'minutes',
      'seconds',
      'milliseconds',
    ]);
    return Object.keys(obj).some(
      (key) => validKeys.has(key) && typeof obj[key] === 'number',
    );
  }

  private buildDatePart(value: DurationComponents): string {
    let result = '';
    if (value.years) result += `${value.years}Y`;
    if (value.months) result += `${value.months}M`;
    if (value.weeks) result += `${value.weeks}W`;
    if (value.days) result += `${value.days}D`;
    return result;
  }

  private buildTimePart(value: DurationComponents): string {
    let result = '';
    if (value.hours) result += `${value.hours}H`;
    if (value.minutes) result += `${value.minutes}M`;

    const seconds =
      (value.seconds || 0) +
      (value.milliseconds ? value.milliseconds / 1000 : 0);
    if (seconds) {
      result += `${seconds}S`;
    }

    return result;
  }
}

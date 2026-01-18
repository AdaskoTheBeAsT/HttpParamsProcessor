import {
  DurationComponents,
  IValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy to serialize DurationComponents to NodaTime Duration format.
 * NodaTime Duration represents time-based amounts and uses ISO 8601 duration format.
 */
export class NodaTimeDurationValueToStrategy implements IValueToStrategy<DurationComponents> {
  serializeValue(value: DurationComponents): string {
    // NodaTime Duration only supports time components (no years/months)
    // Convert all to a consistent time-based representation
    const totalHours = (value.hours || 0) + (value.days || 0) * 24;
    const minutes = value.minutes || 0;
    const seconds =
      (value.seconds || 0) +
      (value.milliseconds ? value.milliseconds / 1000 : 0);

    if (totalHours === 0 && minutes === 0 && seconds === 0) {
      return 'PT0S';
    }

    let result = 'PT';
    if (totalHours) result += `${totalHours}H`;
    if (minutes) result += `${minutes}M`;
    if (seconds) result += `${seconds}S`;

    return result;
  }

  canHandle(value: unknown): value is DurationComponents {
    if (value === null || typeof value !== 'object') {
      return false;
    }
    const obj = value as Record<string, unknown>;
    const timeKeys = new Set([
      'days',
      'hours',
      'minutes',
      'seconds',
      'milliseconds',
    ]);
    return Object.keys(obj).some(
      (key) => timeKeys.has(key) && typeof obj[key] === 'number',
    );
  }
}

import { IValueToStrategy } from '../value-to-strategy.interface';

/**
 * Default strategy for serializing Date objects to ISO 8601 string format.
 */
export class DefaultDateValueToStrategy implements IValueToStrategy<Date> {
  serializeValue(value: Date): string {
    return value.toISOString();
  }

  canHandle(value: unknown): value is Date {
    return value instanceof Date;
  }
}

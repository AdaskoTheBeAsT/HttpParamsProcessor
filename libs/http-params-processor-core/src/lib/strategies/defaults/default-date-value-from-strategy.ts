import { IValueFromStrategy } from '../value-from-strategy.interface';

/**
 * Default pass-through strategy for native JavaScript Date objects.
 * Simply returns the Date as-is since it's already the target intermediate type.
 */
export class DefaultDateValueFromStrategy implements IValueFromStrategy<
  Date,
  Date
> {
  normalizeValue(value: Date): Date {
    return value;
  }

  canHandle(value: unknown): value is Date {
    return value instanceof Date;
  }
}

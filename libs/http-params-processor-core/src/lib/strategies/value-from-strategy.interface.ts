/**
 * Strategy for normalizing library-specific types to standard intermediate types.
 *
 * @template TFrom - The source type (e.g., Dayjs, Moment, luxon.DateTime)
 * @template TTo - The target intermediate type (e.g., Date, DurationComponents, PeriodComponents)
 *
 * @example
 * // Dayjs to Date
 * class DayjsDateValueFromStrategy implements IValueFromStrategy<Dayjs, Date> {
 *   normalizeValue(value: Dayjs): Date { return value.toDate(); }
 *   canHandle(value: unknown): value is Dayjs { return dayjs.isDayjs(value); }
 * }
 */
export interface IValueFromStrategy<TFrom, TTo> {
  /**
   * Normalizes a library-specific value to a standard intermediate type.
   */
  normalizeValue(value: TFrom): TTo;

  /**
   * Type guard to check if this strategy can handle the given value.
   */
  canHandle(value: unknown): value is TFrom;
}

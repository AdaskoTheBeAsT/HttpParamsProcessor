/**
 * Strategy for serializing intermediate types to string output.
 *
 * @template TFrom - The intermediate type to serialize (e.g., Date, DurationComponents, PeriodComponents)
 *
 * @example
 * // Date to Unix timestamp
 * class UnixTimestampValueToStrategy implements IValueToStrategy<Date> {
 *   serializeValue(value: Date): string { return Math.floor(value.getTime() / 1000).toString(); }
 *   canHandle(value: unknown): value is Date { return value instanceof Date; }
 * }
 */
export interface IValueToStrategy<TFrom> {
  /**
   * Serializes an intermediate value to a string for HTTP params.
   */
  serializeValue(value: TFrom): string;

  /**
   * Type guard to check if this strategy can handle the given value.
   */
  canHandle(value: unknown): value is TFrom;
}

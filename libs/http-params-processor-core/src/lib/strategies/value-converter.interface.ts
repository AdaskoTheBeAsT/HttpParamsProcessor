import { IValueFromStrategy } from './value-from-strategy.interface';
import { IValueToStrategy } from './value-to-strategy.interface';

/**
 * A value converter that pairs a value-from strategy with a value-to strategy.
 * This creates a complete conversion pipeline from library-specific types to string output.
 *
 * @template TFrom - The source type (e.g., Dayjs, Moment)
 * @template TIntermediate - The intermediate type (e.g., Date, DurationComponents)
 *
 * @example
 * // Complete pipeline: Dayjs -> Date -> Unix timestamp string
 * const converter = createValueConverter(
 *   new DayjsDateValueFromStrategy(),
 *   new UnixTimestampValueToStrategy()
 * );
 */
export interface IValueConverter<TFrom = unknown, TIntermediate = unknown> {
  /**
   * The strategy for normalizing input values to intermediate type.
   */
  readonly from: IValueFromStrategy<TFrom, TIntermediate>;

  /**
   * The strategy for serializing intermediate values to strings.
   */
  readonly to: IValueToStrategy<TIntermediate>;

  /**
   * Type guard to check if this converter can handle the given value.
   */
  canHandle(value: unknown): value is TFrom;

  /**
   * Converts a value through the full pipeline: TFrom -> TIntermediate -> string
   */
  convert(value: TFrom): string;
}

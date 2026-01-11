import { IValueConverter } from './value-converter.interface';
import { IValueFromStrategy } from './value-from-strategy.interface';
import { IValueToStrategy } from './value-to-strategy.interface';

/**
 * Implementation of IValueConverter that pairs a value-from and value-to strategy.
 */
export class ValueConverter<TFrom, TIntermediate> implements IValueConverter<
  TFrom,
  TIntermediate
> {
  constructor(
    public readonly from: IValueFromStrategy<TFrom, TIntermediate>,
    public readonly to: IValueToStrategy<TIntermediate>,
  ) {}

  canHandle(value: unknown): value is TFrom {
    return this.from.canHandle(value);
  }

  convert(value: TFrom): string {
    const intermediate = this.from.normalizeValue(value);
    return this.to.serializeValue(intermediate);
  }
}

/**
 * Helper function to create a value converter from a pair of strategies.
 *
 * @example
 * const converter = createValueConverter(
 *   new DayjsDateValueFromStrategy(),
 *   new UnixTimestampValueToStrategy()
 * );
 */
export function createValueConverter<TFrom, TIntermediate>(
  from: IValueFromStrategy<TFrom, TIntermediate>,
  to: IValueToStrategy<TIntermediate>,
): ValueConverter<TFrom, TIntermediate> {
  return new ValueConverter(from, to);
}

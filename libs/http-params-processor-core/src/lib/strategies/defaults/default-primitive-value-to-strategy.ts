import { IValueToStrategy } from '../value-to-strategy.interface';

type Primitive = string | number | boolean;

/**
 * Default strategy for serializing primitive values (string, number, boolean) to strings.
 */
export class DefaultPrimitiveValueToStrategy
  implements IValueToStrategy<Primitive>
{
  serializeValue: (value: Primitive) => string = String;

  canHandle(value: unknown): value is Primitive {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }
}

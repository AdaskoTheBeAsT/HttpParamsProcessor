import { IKeyFormattingStrategy } from './strategies/key-formatting-strategy.interface';
import { DefaultKeyFormattingStrategy } from './strategies/default-key-formatting-strategy';
import { IValueConverter } from './strategies/value-converter.interface';
import { ValueConverter } from './strategies/value-converter';
import { DefaultDateValueFromStrategy } from './strategies/defaults/default-date-value-from-strategy';
import { DefaultDateValueToStrategy } from './strategies/defaults/default-date-value-to-strategy';
import { DefaultPrimitiveValueToStrategy } from './strategies/defaults/default-primitive-value-to-strategy';
import { IValueFromStrategy } from './strategies/value-from-strategy.interface';
import { IValueToStrategy } from './strategies/value-to-strategy.interface';

/**
 * Options for processing query parameters.
 */
export interface ParamsProcessorOptions {
  /**
   * Strategy for formatting keys (dot notation, bracket notation, etc.)
   */
  keyFormatter?: IKeyFormattingStrategy;

  /**
   * Array of value converters for converting values to strings.
   * Each converter pairs a value-from strategy with a value-to strategy.
   */
  valueConverters?: IValueConverter[];
}

/**
 * Result of processing an object into query parameters.
 * Returns an array of key-value pairs that can be used with any HTTP client.
 */
export type ParamsEntry = [key: string, value: string];

/**
 * Primitive type alias for string, number, or boolean.
 */
export type Primitive = string | number | boolean;

/**
 * Input object type that can be processed.
 * Accepts any input - the processor handles type checking internally.
 */
export type ProcessableInput =
  | Record<string, unknown>
  | unknown[]
  | null
  | undefined
  | string
  | number
  | boolean
  | Date;

/**
 * Pass-through value-from strategy for primitives (already in target form).
 */
class PrimitivePassThroughValueFromStrategy
  implements IValueFromStrategy<Primitive, Primitive>
{
  normalizeValue(value: Primitive): Primitive {
    return value;
  }

  canHandle(value: unknown): value is Primitive {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }
}

/**
 * Framework-agnostic params processor.
 * Converts complex nested objects into query parameter key-value pairs.
 */
export class ParamsProcessor {
  private readonly defaultKeyFormatter: IKeyFormattingStrategy;
  private readonly defaultValueConverters: IValueConverter[];

  constructor(options?: {
    keyFormatter?: IKeyFormattingStrategy;
    valueConverters?: IValueConverter[];
  }) {
    this.defaultKeyFormatter =
      options?.keyFormatter ?? new DefaultKeyFormattingStrategy();
    this.defaultValueConverters =
      options?.valueConverters ?? this.createDefaultConverters();
  }

  private createDefaultConverters(): IValueConverter[] {
    return [
      new ValueConverter(
        new DefaultDateValueFromStrategy(),
        new DefaultDateValueToStrategy()
      ),
      new ValueConverter(
        new PrimitivePassThroughValueFromStrategy(),
        new DefaultPrimitiveValueToStrategy() as IValueToStrategy<Primitive>
      ),
    ];
  }

  /**
   * Process an object into an array of key-value pairs.
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns Array of [key, value] pairs
   */
  process(
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): ParamsEntry[] {
    const entries: ParamsEntry[] = [];
    const visited = new WeakSet<object>();
    const { keyFormatter, valueConverters } = this.resolveOptions(options);
    this.processInternal(
      entries,
      key,
      obj,
      visited,
      keyFormatter,
      valueConverters
    );
    return entries;
  }

  /**
   * Process an object and return a query string.
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns Encoded query string (without leading '?')
   */
  toQueryString(
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): string {
    const entries = this.process(key, obj, options);
    return entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }

  /**
   * Process an object and return a URLSearchParams instance.
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns URLSearchParams instance
   */
  toURLSearchParams(
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): URLSearchParams {
    const entries = this.process(key, obj, options);
    const params = new URLSearchParams();
    for (const [k, v] of entries) {
      params.append(k, v);
    }
    return params;
  }

  /**
   * Process an object and return a plain object suitable for Axios params.
   * Note: For duplicate keys (arrays), values are collected into arrays.
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns Plain object with string or string[] values
   */
  toPlainObject(
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): Record<string, string | string[]> {
    const entries = this.process(key, obj, options);
    const result: Record<string, string | string[]> = {};

    for (const [k, v] of entries) {
      if (k in result) {
        const existing = result[k];
        if (Array.isArray(existing)) {
          existing.push(v);
        } else {
          result[k] = [existing, v];
        }
      } else {
        result[k] = v;
      }
    }

    return result;
  }

  private resolveOptions(options?: ParamsProcessorOptions): {
    keyFormatter: IKeyFormattingStrategy;
    valueConverters: IValueConverter[];
  } {
    if (!options) {
      return {
        keyFormatter: this.defaultKeyFormatter,
        valueConverters: this.defaultValueConverters,
      };
    }

    return {
      keyFormatter: options.keyFormatter ?? this.defaultKeyFormatter,
      valueConverters: options.valueConverters ?? this.defaultValueConverters,
    };
  }

  private processInternal(
    entries: ParamsEntry[],
    key: string,
    obj: ProcessableInput,
    visited: WeakSet<object>,
    keyFormatter: IKeyFormattingStrategy,
    valueConverters: IValueConverter[]
  ): void {
    if (obj == null) {
      return;
    }

    // Check if key formatter wants to handle complex object directly
    if (
      (Array.isArray(obj) || typeof obj === 'object') &&
      keyFormatter.transformComplexObject
    ) {
      // Create a temporary collector to capture the transform result
      const collector: ParamsEntry[] = [];
      const appender = {
        append(k: string, v: string) {
          collector.push([k, v]);
          return this;
        },
      };

      const result = keyFormatter.transformComplexObject(
        appender,
        key,
        obj as Record<string, unknown> | unknown[]
      );

      if (result !== null) {
        entries.push(...collector);
        return;
      }
    }

    if (Array.isArray(obj)) {
      if (visited.has(obj)) {
        throw new Error(`Circular reference detected at key: ${key}`);
      }
      visited.add(obj);
      this.processArray(entries, key, obj, visited, keyFormatter, valueConverters);
    } else if (
      typeof obj === 'object' &&
      Object.prototype.toString.call(obj) !== '[object Date]'
    ) {
      if (visited.has(obj)) {
        throw new Error(`Circular reference detected at key: ${key}`);
      }
      visited.add(obj);
      this.processObject(
        entries,
        key,
        obj as Record<string, unknown> | null,
        visited,
        keyFormatter,
        valueConverters
      );
    } else {
      this.addEntry(entries, key, obj, valueConverters);
    }
  }

  private addEntry(
    entries: ParamsEntry[],
    key: string,
    elem: unknown,
    valueConverters: IValueConverter[]
  ): void {
    if (elem === undefined || elem === null) {
      return;
    }

    const serialized = this.convertValue(elem, valueConverters);
    entries.push([key, serialized]);
  }

  private convertValue(value: unknown, converters: IValueConverter[]): string {
    for (const converter of converters) {
      if (converter.canHandle(value)) {
        return converter.convert(value);
      }
    }
    // Fallback: convert to string directly
    return String(value);
  }

  private processObject(
    entries: ParamsEntry[],
    key: string,
    obj: Record<string, unknown> | null,
    visited: WeakSet<object>,
    keyFormatter: IKeyFormattingStrategy,
    valueConverters: IValueConverter[]
  ): void {
    for (const property in obj) {
      if (!Object.hasOwn(obj as object, property)) {
        continue;
      }

      if (property === '$type') {
        continue;
      }
      const name = keyFormatter.formatObjectKey(key, property);
      this.processInternal(
        entries,
        name,
        obj[property] as ProcessableInput,
        visited,
        keyFormatter,
        valueConverters
      );
    }
  }

  private processArray(
    entries: ParamsEntry[],
    key: string,
    arr: unknown[],
    visited: WeakSet<object>,
    keyFormatter: IKeyFormattingStrategy,
    valueConverters: IValueConverter[]
  ): void {
    let index = 0;
    for (const item of arr) {
      const name = keyFormatter.formatArrayKey(key, index);
      index++;
      this.processInternal(
        entries,
        name,
        item as ProcessableInput,
        visited,
        keyFormatter,
        valueConverters
      );
    }
  }
}

/**
 * Create a default ParamsProcessor instance.
 */
export function createParamsProcessor(options?: {
  keyFormatter?: IKeyFormattingStrategy;
  valueConverters?: IValueConverter[];
}): ParamsProcessor {
  return new ParamsProcessor(options);
}

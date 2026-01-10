import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { IKeyFormattingStrategy } from './strategies/key-formatting-strategy.interface';
import {
  DefaultKeyFormattingStrategy,
  IValueConverter,
  ValueConverter,
  DefaultDateValueFromStrategy,
  DefaultDateValueToStrategy,
  DefaultPrimitiveValueToStrategy,
  IValueFromStrategy,
  IValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';

/**
 * InjectionToken for providing a custom key formatting strategy application-wide.
 */
export const HTTP_PARAMS_KEY_FORMATTER = new InjectionToken<IKeyFormattingStrategy>(
  'HTTP_PARAMS_KEY_FORMATTER'
);

/**
 * InjectionToken for providing custom value converters application-wide.
 */
export const HTTP_PARAMS_VALUE_CONVERTERS = new InjectionToken<IValueConverter[]>(
  'HTTP_PARAMS_VALUE_CONVERTERS'
);

/**
 * Options for processing query parameters.
 */
export interface HttpParamsProcessorOptions {
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
 * Pass-through value-from strategy for primitives (already in target form).
 */
class PrimitivePassThroughValueFromStrategy implements IValueFromStrategy<string | number | boolean, string | number | boolean> {
  normalizeValue(value: string | number | boolean): string | number | boolean {
    return value;
  }

  canHandle(value: unknown): value is string | number | boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  }
}

@Injectable({
  providedIn: 'root',
})
export class HttpParamsProcessorService {
  private readonly defaultKeyFormatter: IKeyFormattingStrategy =
    inject(HTTP_PARAMS_KEY_FORMATTER, { optional: true }) ?? new DefaultKeyFormattingStrategy();

  private readonly defaultValueConverters: IValueConverter[] =
    inject(HTTP_PARAMS_VALUE_CONVERTERS, { optional: true }) ?? this.createDefaultConverters();

  private createDefaultConverters(): IValueConverter[] {
    return [
      new ValueConverter(new DefaultDateValueFromStrategy(), new DefaultDateValueToStrategy()),
      new ValueConverter(
        new PrimitivePassThroughValueFromStrategy(),
        new DefaultPrimitiveValueToStrategy() as IValueToStrategy<string | number | boolean>
      )
    ];
  }

  process(
    key: string,
    obj: Record<string | number | symbol, unknown> | null | unknown | unknown[],
    options?: HttpParamsProcessorOptions
  ): HttpParams {
    let params = new HttpParams();
    const visited = new WeakSet<object>();
    const { keyFormatter, valueConverters } = this.resolveOptions(options);
    params = this.processWithParamsInternal(params, key, obj, visited, keyFormatter, valueConverters);
    return params;
  }

  processWithParams(
    params: HttpParams,
    key: string,
    obj: Record<string | number | symbol, unknown> | null | unknown | unknown[],
    options?: HttpParamsProcessorOptions
  ): HttpParams {
    if (params == null) {
      throw new Error(
        'params is null or undefined - it should have instance of HttpParams'
      );
    }

    const visited = new WeakSet<object>();
    const { keyFormatter, valueConverters } = this.resolveOptions(options);
    return this.processWithParamsInternal(params, key, obj, visited, keyFormatter, valueConverters);
  }

  private resolveOptions(
    options?: HttpParamsProcessorOptions
  ): { keyFormatter: IKeyFormattingStrategy; valueConverters: IValueConverter[] } {
    if (!options) {
      return {
        keyFormatter: this.defaultKeyFormatter,
        valueConverters: this.defaultValueConverters
      };
    }

    return {
      keyFormatter: options.keyFormatter ?? this.defaultKeyFormatter,
      valueConverters: options.valueConverters ?? this.defaultValueConverters
    };
  }

  private processWithParamsInternal(
    params: HttpParams,
    key: string,
    obj: Record<string | number | symbol, unknown> | null | unknown | unknown[],
    visited: WeakSet<object>,
    keyFormatter: IKeyFormattingStrategy,
    valueConverters: IValueConverter[]
  ): HttpParams {
    if (obj == null) {
      return params;
    }

    if ((Array.isArray(obj) || typeof obj === 'object') && keyFormatter.transformComplexObject) {
      const transformed = keyFormatter.transformComplexObject(params, key, obj as Record<string, unknown> | unknown[]);
      if (transformed !== null) {
        return transformed;
      }
    }

    if (Array.isArray(obj)) {
      if (visited.has(obj)) {
        throw new Error(`Circular reference detected at key: ${key}`);
      }
      visited.add(obj);
      return this.processArray(params, key, obj, visited, keyFormatter, valueConverters);
    } else if (
      typeof obj === 'object' &&
      Object.prototype.toString.call(obj) !== '[object Date]'
    ) {
      if (visited.has(obj as object)) {
        throw new Error(`Circular reference detected at key: ${key}`);
      }
      visited.add(obj as object);
      return this.processObject(
        params,
        key,
        obj as Record<string | number | symbol, unknown> | null,
        visited,
        keyFormatter,
        valueConverters
      );
    } else {
      return this.addToHttpParams(params, key, obj, valueConverters);
    }
  }

  private addToHttpParams(
    params: HttpParams,
    key: string,
    elem: unknown,
    valueConverters: IValueConverter[]
  ): HttpParams {
    if (elem === undefined || elem === null) {
      return params;
    }

    const serialized = this.convertValue(elem, valueConverters);
    return params.append(key, serialized);
  }

  private convertValue(value: unknown, converters: IValueConverter[]): string {
    for (const converter of converters) {
      if (converter.canHandle(value)) {
        return converter.convert(value);
      }
    }
    return String(value);
  }

  private processObject(
    params: HttpParams,
    key: string,
    obj: Record<string, unknown> | null,
    visited: WeakSet<object>,
    keyFormatter: IKeyFormattingStrategy,
    valueConverters: IValueConverter[]
  ): HttpParams {
    let retPar = params;
    for (const property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property)) {
        continue;
      }

      if (property === '$type') {
        continue;
      }
      const name = keyFormatter.formatObjectKey(key, property);
      retPar = this.processWithParamsInternal(retPar, name, obj[property], visited, keyFormatter, valueConverters);
    }

    return retPar;
  }

  private processArray(
    params: HttpParams,
    key: string,
    arr: unknown[],
    visited: WeakSet<object>,
    keyFormatter: IKeyFormattingStrategy,
    valueConverters: IValueConverter[]
  ): HttpParams {
    let retPar = params;
    let index = 0;
    for (const item of arr) {
      const name = keyFormatter.formatArrayKey(key, index);
      index++;
      retPar = this.processWithParamsInternal(retPar, name, item, visited, keyFormatter, valueConverters);
    }

    return retPar;
  }
}

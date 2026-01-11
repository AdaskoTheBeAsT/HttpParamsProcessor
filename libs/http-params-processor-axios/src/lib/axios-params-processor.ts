import {
  IKeyFormattingStrategy,
  IValueConverter,
  ParamsProcessor,
  ParamsProcessorOptions,
  ProcessableInput,
} from '@adaskothebeast/http-params-processor-core';

/**
 * Options for the Axios params processor.
 */
export interface AxiosParamsProcessorOptions extends ParamsProcessorOptions {
  /**
   * Whether to encode the query string (default: true)
   */
  encode?: boolean;
}

/**
 * Configuration options for creating the Axios params processor.
 */
export interface AxiosParamsProcessorConfig {
  /**
   * Default key formatting strategy
   */
  keyFormatter?: IKeyFormattingStrategy;

  /**
   * Default value converters
   */
  valueConverters?: IValueConverter[];
}

/**
 * Axios-specific params processor.
 * Provides methods compatible with Axios's paramsSerializer option.
 */
export class AxiosParamsProcessor {
  private readonly processor: ParamsProcessor;

  constructor(config?: AxiosParamsProcessorConfig) {
    this.processor = new ParamsProcessor({
      keyFormatter: config?.keyFormatter,
      valueConverters: config?.valueConverters,
    });
  }

  /**
   * Serialize an object to a query string for Axios.
   * Can be used directly as Axios's paramsSerializer function.
   *
   * @param key - The root parameter name
   * @param obj - The object to serialize
   * @param options - Optional configuration
   * @returns Encoded query string
   *
   * @example
   * ```typescript
   * const processor = new AxiosParamsProcessor();
   *
   * axios.get('/api', {
   *   params: { filters: { status: 'active' } },
   *   paramsSerializer: (params) => processor.serialize('', params)
   * });
   * ```
   */
  serialize(
    key: string,
    obj: ProcessableInput,
    options?: AxiosParamsProcessorOptions,
  ): string {
    const encode = options?.encode ?? true;
    const entries = this.processor.process(key, obj, options);

    if (encode) {
      return entries
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    }

    return entries.map(([k, v]) => `${k}=${v}`).join('&');
  }

  /**
   * Create a paramsSerializer function for Axios.
   * The returned function can be used directly in Axios config.
   *
   * @param key - The root parameter name (use empty string for no prefix)
   * @param options - Optional configuration
   * @returns A function compatible with Axios paramsSerializer
   *
   * @example
   * ```typescript
   * const processor = new AxiosParamsProcessor();
   *
   * // Global Axios config
   * axios.defaults.paramsSerializer = processor.createSerializer('');
   *
   * // Per-request config
   * axios.get('/api', {
   *   params: myComplexObject,
   *   paramsSerializer: processor.createSerializer('filter')
   * });
   * ```
   */
  createSerializer(
    key: string,
    options?: AxiosParamsProcessorOptions,
  ): (params: ProcessableInput) => string {
    return (params: ProcessableInput) => this.serialize(key, params, options);
  }

  /**
   * Process an object and return params suitable for Axios.
   * Returns a plain object that Axios can use directly.
   *
   * @param key - The root parameter name
   * @param obj - The object to process
   * @param options - Optional configuration
   * @returns Plain object with processed keys
   *
   * @example
   * ```typescript
   * const processor = new AxiosParamsProcessor();
   * const params = processor.toParams('filter', { user: { name: 'John' } });
   * // Result: { 'filter.user.name': 'John' }
   *
   * axios.get('/api', { params });
   * ```
   */
  toParams(
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions,
  ): Record<string, string | string[]> {
    return this.processor.toPlainObject(key, obj, options);
  }

  /**
   * Get the underlying ParamsProcessor instance.
   */
  get coreProcessor(): ParamsProcessor {
    return this.processor;
  }
}

/**
 * Create an AxiosParamsProcessor instance.
 *
 * @example
 * ```typescript
 * import { createAxiosParamsProcessor } from '@adaskothebeast/params-processor-axios';
 *
 * const processor = createAxiosParamsProcessor();
 *
 * // Use with Axios
 * axios.get('/api/products', {
 *   params: { filter: { category: 'electronics', price: { min: 100 } } },
 *   paramsSerializer: processor.createSerializer('')
 * });
 * ```
 */
export function createAxiosParamsProcessor(
  config?: AxiosParamsProcessorConfig,
): AxiosParamsProcessor {
  return new AxiosParamsProcessor(config);
}

/**
 * Create a standalone paramsSerializer function for Axios.
 * This is a convenience function for one-off use cases.
 *
 * @param key - The root parameter name
 * @param config - Optional processor configuration
 * @returns A paramsSerializer function
 *
 * @example
 * ```typescript
 * import { createParamsSerializer } from '@adaskothebeast/params-processor-axios';
 *
 * axios.get('/api', {
 *   params: myObject,
 *   paramsSerializer: createParamsSerializer('filter')
 * });
 * ```
 */
export function createParamsSerializer(
  key: string,
  config?: AxiosParamsProcessorConfig,
): (params: ProcessableInput) => string {
  const processor = new AxiosParamsProcessor(config);
  return processor.createSerializer(key);
}

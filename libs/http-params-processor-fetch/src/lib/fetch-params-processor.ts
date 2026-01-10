import {
  ParamsProcessor,
  ParamsProcessorOptions,
  ProcessableInput,
  IKeyFormattingStrategy,
  IValueConverter,
} from '@adaskothebeast/http-params-processor-core';

/**
 * Configuration options for creating the Fetch params processor.
 */
export interface FetchParamsProcessorConfig {
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
 * Fetch API-specific params processor.
 * Provides methods compatible with the Fetch API and URLSearchParams.
 */
export class FetchParamsProcessor {
  private readonly processor: ParamsProcessor;

  constructor(config?: FetchParamsProcessorConfig) {
    this.processor = new ParamsProcessor({
      keyFormatter: config?.keyFormatter,
      valueConverters: config?.valueConverters,
    });
  }

  /**
   * Convert an object to URLSearchParams.
   *
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns URLSearchParams instance
   *
   * @example
   * ```typescript
   * const processor = new FetchParamsProcessor();
   * const params = processor.toURLSearchParams('filter', { status: 'active' });
   *
   * fetch(`/api/data?${params}`);
   * // or
   * fetch('/api/data', {
   *   method: 'POST',
   *   body: params
   * });
   * ```
   */
  toURLSearchParams(
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): URLSearchParams {
    return this.processor.toURLSearchParams(key, obj, options);
  }

  /**
   * Convert an object to a query string.
   *
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns Encoded query string (without leading '?')
   *
   * @example
   * ```typescript
   * const processor = new FetchParamsProcessor();
   * const query = processor.toQueryString('filter', { status: 'active' });
   *
   * fetch(`/api/data?${query}`);
   * ```
   */
  toQueryString(
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): string {
    return this.processor.toQueryString(key, obj, options);
  }

  /**
   * Build a complete URL with query parameters.
   *
   * @param baseUrl - The base URL
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns Complete URL with query parameters
   *
   * @example
   * ```typescript
   * const processor = new FetchParamsProcessor();
   * const url = processor.buildUrl('/api/products', 'filter', {
   *   category: 'electronics',
   *   price: { min: 100, max: 500 }
   * });
   *
   * fetch(url);
   * // URL: /api/products?filter.category=electronics&filter.price.min=100&filter.price.max=500
   * ```
   */
  buildUrl(
    baseUrl: string,
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): string {
    const queryString = this.toQueryString(key, obj, options);
    if (!queryString) {
      return baseUrl;
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${queryString}`;
  }

  /**
   * Build a URL object with query parameters.
   *
   * @param baseUrl - The base URL (can be string or URL)
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns URL object with query parameters
   *
   * @example
   * ```typescript
   * const processor = new FetchParamsProcessor();
   * const url = processor.buildUrlObject('https://api.example.com/products', 'filter', {
   *   category: 'electronics'
   * });
   *
   * fetch(url);
   * ```
   */
  buildUrlObject(
    baseUrl: string | URL,
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): URL {
    const url = new URL(baseUrl.toString());
    const params = this.toURLSearchParams(key, obj, options);

    // Append each entry to the URL's search params
    for (const [paramKey, value] of params) {
      url.searchParams.append(paramKey, value);
    }

    return url;
  }

  /**
   * Merge processed params with existing URLSearchParams.
   *
   * @param existingParams - Existing URLSearchParams to merge into
   * @param key - The root parameter name
   * @param obj - The object to convert
   * @param options - Optional configuration
   * @returns The merged URLSearchParams (same instance)
   *
   * @example
   * ```typescript
   * const processor = new FetchParamsProcessor();
   * const params = new URLSearchParams({ page: '1', size: '10' });
   *
   * processor.appendTo(params, 'filter', { status: 'active' });
   * // params now contains: page=1&size=10&filter.status=active
   * ```
   */
  appendTo(
    existingParams: URLSearchParams,
    key: string,
    obj: ProcessableInput,
    options?: ParamsProcessorOptions
  ): URLSearchParams {
    const newParams = this.toURLSearchParams(key, obj, options);

    for (const [paramKey, value] of newParams) {
      existingParams.append(paramKey, value);
    }

    return existingParams;
  }

  /**
   * Get the underlying ParamsProcessor instance.
   */
  get coreProcessor(): ParamsProcessor {
    return this.processor;
  }
}

/**
 * Create a FetchParamsProcessor instance.
 *
 * @example
 * ```typescript
 * import { createFetchParamsProcessor } from '@adaskothebeast/params-processor-fetch';
 *
 * const processor = createFetchParamsProcessor();
 *
 * const response = await fetch(
 *   processor.buildUrl('/api/search', 'query', {
 *     term: 'typescript',
 *     filters: { type: 'library' }
 *   })
 * );
 * ```
 */
export function createFetchParamsProcessor(
  config?: FetchParamsProcessorConfig
): FetchParamsProcessor {
  return new FetchParamsProcessor(config);
}

/**
 * Convenience function to build a URL with query parameters.
 *
 * @example
 * ```typescript
 * import { buildFetchUrl } from '@adaskothebeast/params-processor-fetch';
 *
 * const url = buildFetchUrl('/api/products', 'filter', {
 *   category: 'electronics',
 *   inStock: true
 * });
 *
 * fetch(url);
 * ```
 */
export function buildFetchUrl(
  baseUrl: string,
  key: string,
  obj: ProcessableInput,
  config?: FetchParamsProcessorConfig
): string {
  const processor = new FetchParamsProcessor(config);
  return processor.buildUrl(baseUrl, key, obj);
}

/**
 * Convenience function to create URLSearchParams from an object.
 *
 * @example
 * ```typescript
 * import { toFetchParams } from '@adaskothebeast/params-processor-fetch';
 *
 * const params = toFetchParams('filter', { status: 'active' });
 *
 * fetch(`/api/data?${params}`);
 * ```
 */
export function toFetchParams(
  key: string,
  obj: ProcessableInput,
  config?: FetchParamsProcessorConfig
): URLSearchParams {
  const processor = new FetchParamsProcessor(config);
  return processor.toURLSearchParams(key, obj);
}

import useSWR, { SWRConfiguration, SWRResponse, Key } from 'swr';
import {
  ParamsProcessor,
  IKeyFormattingStrategy,
  IValueConverter,
} from '@adaskothebeast/http-params-processor-core';

/**
 * Options for the params processor used in SWR hooks.
 */
export interface SWRParamsProcessorOptions {
  /**
   * Strategy for formatting keys (dot notation, bracket notation, etc.)
   */
  keyFormatter?: IKeyFormattingStrategy;

  /**
   * Array of value converters for converting values to strings.
   */
  valueConverters?: IValueConverter[];
}

/**
 * Options for useSWRWithParams hook.
 */
export interface UseSWRWithParamsOptions<TData, TError = Error> {
  /**
   * The base URL for the request.
   */
  url: string;

  /**
   * The key prefix for the processed parameters.
   */
  paramsKey: string;

  /**
   * The complex object to be processed into query parameters.
   */
  params: Record<string, unknown>;

  /**
   * Options for the HttpParamsProcessor.
   */
  processorOptions?: SWRParamsProcessorOptions;

  /**
   * SWR configuration options.
   */
  swrOptions?: SWRConfiguration<TData, TError>;

  /**
   * Custom fetch function. Defaults to global fetch.
   */
  fetchFn?: typeof fetch;

  /**
   * Additional fetch options (headers, credentials, etc.).
   */
  fetchOptions?: RequestInit;
}

/**
 * Builds a URL with processed query parameters.
 *
 * @param url - The base URL
 * @param paramsKey - The key prefix for parameters
 * @param params - The params object to process
 * @param processorOptions - Options for the processor
 * @returns The complete URL with query string
 */
export function buildUrlWithParams(
  url: string,
  paramsKey: string,
  params: Record<string, unknown>,
  processorOptions?: SWRParamsProcessorOptions
): string {
  const processor = new ParamsProcessor({
    keyFormatter: processorOptions?.keyFormatter,
    valueConverters: processorOptions?.valueConverters,
  });

  const queryString = processor.toQueryString(paramsKey, params);

  if (!queryString) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

/**
 * Creates a fetcher function for SWR that processes params.
 *
 * @param options - Fetcher options
 * @returns A fetcher function for SWR
 */
export function createFetcherWithParams<TData>(options: {
  paramsKey: string;
  params: Record<string, unknown>;
  processorOptions?: SWRParamsProcessorOptions;
  fetchFn?: typeof fetch;
  fetchOptions?: RequestInit;
}): (url: string) => Promise<TData> {
  return async (url: string) => {
    const fullUrl = buildUrlWithParams(
      url,
      options.paramsKey,
      options.params,
      options.processorOptions
    );

    const fetchFn = options.fetchFn ?? fetch;
    const response = await fetchFn(fullUrl, {
      method: 'GET',
      ...options.fetchOptions,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<TData>;
  };
}

/**
 * SWR hook that automatically processes complex params into query strings.
 *
 * @param options - Configuration options for the SWR hook
 * @returns SWRResponse with the fetched data
 *
 * @example
 * ```typescript
 * const { data, error, isLoading, mutate } = useSWRWithParams<User[]>({
 *   url: '/api/users',
 *   paramsKey: 'filter',
 *   params: {
 *     status: 'active',
 *     roles: ['admin', 'user'],
 *     dateRange: {
 *       from: new Date('2024-01-01'),
 *       to: new Date('2024-12-31')
 *     }
 *   }
 * });
 * ```
 */
export function useSWRWithParams<TData, TError = Error>(
  options: UseSWRWithParamsOptions<TData, TError>
): SWRResponse<TData, TError> {
  const {
    url,
    paramsKey,
    params,
    processorOptions,
    swrOptions,
    fetchFn,
    fetchOptions,
  } = options;

  const fullUrl = buildUrlWithParams(url, paramsKey, params, processorOptions);

  const fetcher = async (fetchUrl: string): Promise<TData> => {
    const fetchFunction = fetchFn ?? fetch;
    const response = await fetchFunction(fetchUrl, {
      method: 'GET',
      ...fetchOptions,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<TData>;
  };

  return useSWR<TData, TError>(fullUrl, fetcher, swrOptions);
}

/**
 * Creates a SWR key with processed params.
 * The key includes the full URL with query parameters.
 *
 * @param url - The base URL
 * @param paramsKey - The key prefix for parameters
 * @param params - The params object to process
 * @param processorOptions - Options for the processor
 * @returns The SWR key (full URL with query string)
 */
export function createSWRKey(
  url: string,
  paramsKey: string,
  params: Record<string, unknown>,
  processorOptions?: SWRParamsProcessorOptions
): Key {
  return buildUrlWithParams(url, paramsKey, params, processorOptions);
}

/**
 * Creates a URL with processed params without making a request.
 * Useful for debugging or when you need the URL for other purposes.
 *
 * @param url - The base URL
 * @param paramsKey - The key prefix for parameters
 * @param params - The params object to process
 * @param processorOptions - Options for the processor
 * @returns The complete URL with query string
 *
 * @example
 * ```typescript
 * const url = getProcessedUrl(
 *   '/api/users',
 *   'filter',
 *   { status: 'active', roles: ['admin'] }
 * );
 * // Returns: /api/users?filter.status=active&filter.roles[0]=admin
 * ```
 */
export function getProcessedUrl(
  url: string,
  paramsKey: string,
  params: Record<string, unknown>,
  processorOptions?: SWRParamsProcessorOptions
): string {
  return buildUrlWithParams(url, paramsKey, params, processorOptions);
}

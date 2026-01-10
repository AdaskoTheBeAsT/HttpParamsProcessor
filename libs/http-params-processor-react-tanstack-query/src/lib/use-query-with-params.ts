import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
  queryOptions,
} from '@tanstack/react-query';
import {
  ParamsProcessor,
  IKeyFormattingStrategy,
  IValueConverter,
} from '@adaskothebeast/http-params-processor-core';

/**
 * Options for the params processor used in query hooks.
 */
export interface QueryParamsProcessorOptions {
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
 * Options for useQueryWithParams hook.
 */
export interface UseQueryWithParamsOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  /**
   * The query key for caching.
   */
  queryKey: QueryKey;

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
  processorOptions?: QueryParamsProcessorOptions;

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
  processorOptions?: QueryParamsProcessorOptions
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
 * Creates a query function that fetches data with processed params.
 *
 * @param options - The query options
 * @returns A query function for TanStack Query
 */
function createQueryFn<TData>(
  options: Pick<
    UseQueryWithParamsOptions<TData>,
    'url' | 'paramsKey' | 'params' | 'processorOptions' | 'fetchFn' | 'fetchOptions'
  >
): () => Promise<TData> {
  return async () => {
    const fullUrl = buildUrlWithParams(
      options.url,
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
 * React Query hook that automatically processes complex params into query strings.
 *
 * @param options - Configuration options for the query
 * @returns UseQueryResult with the fetched data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useQueryWithParams<User[]>({
 *   queryKey: ['users'],
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
export function useQueryWithParams<TData, TError = Error>(
  options: UseQueryWithParamsOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const {
    queryKey,
    url,
    paramsKey,
    params,
    processorOptions,
    fetchFn,
    fetchOptions,
    ...queryOptions
  } = options;

  return useQuery<TData, TError, TData, QueryKey>({
    queryKey: [...queryKey, paramsKey, params],
    queryFn: createQueryFn<TData>({
      url,
      paramsKey,
      params,
      processorOptions,
      fetchFn,
      fetchOptions,
    }),
    ...queryOptions,
  });
}

/**
 * Options for createQueryOptionsWithParams function.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface CreateQueryOptionsWithParamsOptions<TData> {
  /**
   * The query key for caching.
   */
  queryKey: QueryKey;

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
  processorOptions?: QueryParamsProcessorOptions;

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
 * Creates query options object for use with useQuery or prefetching.
 * Useful for prefetching data or sharing query configuration.
 *
 * @param options - Configuration options
 * @returns Query options object compatible with TanStack Query
 *
 * @example
 * ```typescript
 * const queryClient = useQueryClient();
 *
 * // Prefetch data
 * await queryClient.prefetchQuery(
 *   createQueryOptionsWithParams<User[]>({
 *     queryKey: ['users'],
 *     url: '/api/users',
 *     paramsKey: 'filter',
 *     params: { status: 'active' }
 *   })
 * );
 * ```
 */
export function createQueryOptionsWithParams<TData>(
  options: CreateQueryOptionsWithParamsOptions<TData>
) {
  const { queryKey, url, paramsKey, params, processorOptions, fetchFn, fetchOptions } = options;

  return queryOptions<TData>({
    queryKey: [...queryKey, paramsKey, params],
    queryFn: createQueryFn<TData>({
      url,
      paramsKey,
      params,
      processorOptions,
      fetchFn,
      fetchOptions,
    }),
  });
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
  processorOptions?: QueryParamsProcessorOptions
): string {
  return buildUrlWithParams(url, paramsKey, params, processorOptions);
}

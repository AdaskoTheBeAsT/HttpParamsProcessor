import {
  HttpParamsProcessorOptions,
  HttpParamsProcessorService,
} from '@adaskothebeast/http-params-processor-angular';
import {
  HttpResourceOptions,
  HttpResourceRef,
  HttpResourceRequest,
  httpResource,
} from '@angular/common/http';
import { Injector, Signal, inject } from '@angular/core';

/**
 * Options for httpResourceWithParams.
 */
export interface HttpResourceWithParamsOptions<TResult, TRaw = unknown> {
  /**
   * The base URL for the request.
   */
  url: string | (() => string | undefined);

  /**
   * The key prefix for the processed parameters.
   */
  paramsKey: string;

  /**
   * The complex object to be processed into query parameters.
   * Can be a signal or a function returning the params object.
   */
  paramsValue:
    | Signal<Record<string, unknown> | undefined>
    | (() => Record<string, unknown> | undefined);

  /**
   * Options for the HttpParamsProcessor.
   */
  processorOptions?: HttpParamsProcessorOptions;

  /**
   * Additional static params to include in the request.
   */
  additionalParams?: Record<string, string | string[]>;

  /**
   * HTTP method (default: 'GET').
   */
  method?: string;

  /**
   * HTTP headers for the request.
   */
  headers?:
    | Record<string, string | string[]>
    | (() => Record<string, string | string[]>);

  /**
   * Request body (for POST, PUT, etc.).
   */
  body?: unknown;

  /**
   * Whether to report download progress.
   */
  reportProgress?: boolean;

  /**
   * Whether to include credentials.
   */
  withCredentials?: boolean;

  /**
   * Default value for the resource.
   */
  defaultValue?: TResult;

  /**
   * Custom equality function for comparing values.
   */
  equal?: (a: TResult, b: TResult) => boolean;

  /**
   * Custom injector for the resource.
   */
  injector?: Injector;

  /**
   * Map function to transform the raw response.
   */
  map?: (value: TRaw) => TResult;
}

/**
 * Creates an httpResource with complex query parameters processed by HttpParamsProcessor.
 *
 * @param options - Configuration options for the resource
 * @returns HttpResourceRef with the processed parameters
 *
 * @example
 * ```typescript
 * // Basic usage
 * const usersResource = httpResourceWithParams<User[]>({
 *   url: '/api/users',
 *   paramsKey: 'filter',
 *   paramsValue: () => ({
 *     status: 'active',
 *     roles: ['admin', 'user']
 *   })
 * });
 *
 * // With reactive params
 * const filterSignal = signal({ status: 'active' });
 * const usersResource = httpResourceWithParams<User[]>({
 *   url: '/api/users',
 *   paramsKey: 'filter',
 *   paramsValue: filterSignal
 * });
 *
 * // With custom key formatter
 * const usersResource = httpResourceWithParams<User[]>({
 *   url: '/api/users',
 *   paramsKey: 'filter',
 *   paramsValue: () => ({ status: 'active' }),
 *   processorOptions: {
 *     keyFormatter: new BracketNotationKeyFormattingStrategy()
 *   }
 * });
 * ```
 */
export function httpResourceWithParams<TResult>(
  options: HttpResourceWithParamsOptions<TResult> & { defaultValue: TResult },
): HttpResourceRef<TResult>;
export function httpResourceWithParams<TResult>(
  options: HttpResourceWithParamsOptions<TResult>,
): HttpResourceRef<TResult | undefined>;
export function httpResourceWithParams<TResult>(
  options: HttpResourceWithParamsOptions<TResult>,
): HttpResourceRef<TResult | undefined> {
  const processor = inject(HttpParamsProcessorService);
  const injector = inject(Injector);

  const requestFn = (): HttpResourceRequest | undefined => {
    const url = typeof options.url === 'function' ? options.url() : options.url;

    if (url === undefined) {
      return undefined;
    }

    const paramsObj =
      typeof options.paramsValue === 'function'
        ? (options.paramsValue as () => Record<string, unknown> | undefined)()
        : (
            options.paramsValue as Signal<Record<string, unknown> | undefined>
          )();

    if (paramsObj === undefined) {
      return undefined;
    }

    const httpParams = processor.process(
      options.paramsKey,
      paramsObj,
      options.processorOptions,
    );

    const params: Record<string, string | string[]> = {
      ...options.additionalParams,
    };

    httpParams.keys().forEach((key) => {
      const values = httpParams.getAll(key);
      if (values && values.length > 0) {
        params[key] = values.length === 1 ? values[0] : values;
      }
    });

    const request: HttpResourceRequest = {
      url,
      method: options.method ?? 'GET',
      params,
    };

    if (options.headers) {
      request.headers =
        typeof options.headers === 'function'
          ? options.headers()
          : options.headers;
    }

    if (options.body !== undefined) {
      request.body = options.body;
    }

    if (options.reportProgress !== undefined) {
      request.reportProgress = options.reportProgress;
    }

    if (options.withCredentials !== undefined) {
      request.withCredentials = options.withCredentials;
    }

    return request;
  };

  const resourceOptions: HttpResourceOptions<TResult, unknown> = {};

  if (options.defaultValue !== undefined) {
    (resourceOptions as { defaultValue: TResult }).defaultValue =
      options.defaultValue;
  }

  if (options.equal !== undefined) {
    resourceOptions.equal = options.equal;
  }

  if (options.map !== undefined) {
    (
      resourceOptions as HttpResourceOptions<TResult, unknown> & {
        map?: (value: unknown) => TResult;
      }
    ).map = options.map;
  }

  resourceOptions.injector = options.injector ?? injector;

  return httpResource<TResult>(requestFn, resourceOptions);
}

/**
 * Options for creating a reactive httpResource with params.
 */
export interface ReactiveHttpResourceWithParamsOptions<
  T,
  P extends Record<string, unknown>,
> extends Omit<HttpResourceWithParamsOptions<T>, 'paramsValue'> {
  /**
   * A function that returns the params object based on reactive signals.
   */
  params: () => P | undefined;
}

/**
 * Creates a reactive httpResource with complex query parameters.
 * The resource automatically reloads when any signal in the params function changes.
 *
 * @param options - Configuration options for the resource
 * @returns HttpResourceRef with the processed parameters
 *
 * @example
 * ```typescript
 * const statusFilter = signal('active');
 * const roleFilter = signal(['admin']);
 *
 * const usersResource = reactiveHttpResourceWithParams<User[], FilterParams>({
 *   url: '/api/users',
 *   paramsKey: 'filter',
 *   params: () => ({
 *     status: statusFilter(),
 *     roles: roleFilter()
 *   })
 * });
 *
 * // Resource automatically reloads when statusFilter or roleFilter changes
 * statusFilter.set('inactive');
 * ```
 */
export function reactiveHttpResourceWithParams<
  TResult,
  P extends Record<string, unknown>,
>(
  options: ReactiveHttpResourceWithParamsOptions<TResult, P> & {
    defaultValue: TResult;
  },
): HttpResourceRef<TResult>;
export function reactiveHttpResourceWithParams<
  TResult,
  P extends Record<string, unknown>,
>(
  options: ReactiveHttpResourceWithParamsOptions<TResult, P>,
): HttpResourceRef<TResult | undefined>;
export function reactiveHttpResourceWithParams<
  TResult,
  P extends Record<string, unknown>,
>(
  options: ReactiveHttpResourceWithParamsOptions<TResult, P>,
): HttpResourceRef<TResult | undefined> {
  return httpResourceWithParams<TResult>({
    ...options,
    paramsValue: options.params,
  });
}

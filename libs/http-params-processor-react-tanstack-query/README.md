# ⚛️ @adaskothebeast/http-params-processor-react-tanstack-query

**The TanStack Query adapter of [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): a `useQuery` hook that flattens nested params into the request URL for you.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-react-tanstack-query?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` and TanStack Query; requests use the platform `fetch`. ESM only (`"type": "module"`). `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-react-tanstack-query @adaskothebeast/http-params-processor-core
```

Peer dependencies: `@adaskothebeast/http-params-processor-core ^12.0.0`, `@tanstack/react-query >=5.0.0`.

---

## 🎯 What it does

`useQueryWithParams` builds the request URL from `url` + `paramsKey` + `params`, wires a `GET` fetcher, and derives the cache key from the same inputs:

```text
url:      /api/users
queryKey: ['users', 'filter', { status: 'active' }]
request:  /api/users?filter.status=active
```

Everything else is plain TanStack Query, so `staleTime`, `enabled`, `select`, `retry` and friends still work.

---

## 🧰 API

| Export                                                          | Returns                         | Notes                                                    |
| --------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| `useQueryWithParams<TData, TError>(options)`                    | `UseQueryResult<TData, TError>` | Hook; wraps `useQuery`                                   |
| `createQueryOptionsWithParams<TData>(options)`                  | `queryOptions` object           | For `prefetchQuery`, `ensureQueryData` or sharing config |
| `buildUrlWithParams(url, paramsKey, params, processorOptions?)` | `string`                        | The URL builder used internally                          |
| `getProcessedUrl(url, paramsKey, params, processorOptions?)`    | `string`                        | Alias of `buildUrlWithParams`, handy for debugging       |

### Options

`UseQueryWithParamsOptions<TData, TError>` extends `UseQueryOptions` with `'queryKey' | 'queryFn'` omitted, and adds:

| Option             | Type                          | Default             |
| ------------------ | ----------------------------- | ------------------- |
| `queryKey`         | `QueryKey`                    | required            |
| `url`              | `string`                      | required            |
| `paramsKey`        | `string`                      | required            |
| `params`           | `Record<string, unknown>`     | required            |
| `processorOptions` | `QueryParamsProcessorOptions` | core defaults       |
| `fetchFn`          | `typeof fetch`                | global `fetch`      |
| `fetchOptions`     | `RequestInit`                 | `{ method: 'GET' }` |

`CreateQueryOptionsWithParamsOptions<TData>` accepts exactly the same fields **except** the TanStack options (no `staleTime`, `enabled`, …).

`QueryParamsProcessorOptions` is `{ keyFormatter?, valueConverters? }`.

---

## ⚡ Usage

```tsx
import { useQueryWithParams } from '@adaskothebeast/http-params-processor-react-tanstack-query';

function Users() {
  const { data, isLoading, error } = useQueryWithParams<User[]>({
    queryKey: ['users'],
    url: '/api/users',
    paramsKey: 'filter',
    params: {
      status: 'active',
      roles: ['admin', 'user'],
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      },
    },
    staleTime: 30_000,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <UserList users={data ?? []} />;
}
```

Prefetching or sharing configuration:

```ts
import { createQueryOptionsWithParams } from '@adaskothebeast/http-params-processor-react-tanstack-query';

await queryClient.prefetchQuery(
  createQueryOptionsWithParams<User[]>({
    queryKey: ['users'],
    url: '/api/users',
    paramsKey: 'filter',
    params: { status: 'active' },
  }),
);
```

Credentials, headers and a custom transport:

```ts
useQueryWithParams<User[]>({
  queryKey: ['users'],
  url: '/api/users',
  paramsKey: 'filter',
  params: { status: 'active' },
  fetchOptions: {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  },
  fetchFn: myInstrumentedFetch,
});
```

---

## 🎛️ Options and configuration

```ts
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';

useQueryWithParams<User[]>({
  queryKey: ['users'],
  url: '/api/users',
  paramsKey: 'filter',
  params: { user: { name: 'John' } },
  processorOptions: {
    keyFormatter: new BracketNotationKeyFormattingStrategy(),
  },
});
// /api/users?filter%5Buser%5D%5Bname%5D=John
```

`processorOptions` is per hook call; there is no provider or global registry here. A fresh `ParamsProcessor` is created inside `buildUrlWithParams` on every call, so the options object is the only place configuration lives.

Providing `valueConverters` replaces the core defaults, so include a `Date` converter if you still pass native dates.

---

## 📤 Output examples

`buildUrlWithParams` / `getProcessedUrl` results:

```ts
buildUrlWithParams('/api/users', 'filter', { status: 'active', count: 10 });
// /api/users?filter.status=active&filter.count=10

buildUrlWithParams('/api/users', 'filter', { user: { name: 'John', age: 30 } });
// /api/users?filter.user.name=John&filter.user.age=30

buildUrlWithParams('/api/users', 'filter', { roles: ['admin', 'user'] });
// /api/users?filter.roles%5B0%5D=admin&filter.roles%5B1%5D=user

buildUrlWithParams('/api/users', 'filter', {
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
});
// /api/users?filter.createdAt=2024-01-01T00%3A00%3A00.000Z

buildUrlWithParams('/api/users?page=1', 'filter', { status: 'active' });
// /api/users?page=1&filter.status=active

buildUrlWithParams('/api/users', 'filter', { a: null, b: undefined });
// /api/users
```

The effective cache key is `[...queryKey, paramsKey, params]`, for example `['users', 'filter', { status: 'active' }]`.

---

## ⚠️ Edge cases

- The hook needs a `QueryClientProvider` above it, like any TanStack Query hook.
- **Query key stability comes from TanStack Query's structural hashing**, not from object identity, so recreating the `params` literal on every render does not cause refetches. The trade-off: `params` must be hashable, so avoid functions or class instances that do not survive `JSON.stringify` inside it.
- Because `paramsKey` and `params` are appended to your `queryKey`, two calls that differ only in params get separate cache entries automatically. Keep `queryKey` as the stable prefix (`['users']`).
- Non-`ok` responses throw `Error: HTTP error! status: <status>`; the body is not read, so add your own error parsing through `fetchFn` if you need details.
- The response is always parsed with `response.json()`. Endpoints that return `204 No Content` or text will reject.
- `fetchOptions` is spread **after** `method: 'GET'`, so passing `method` there overrides the verb (the params still go in the query string, not the body).
- `enabled: false` works as usual and prevents the request; there is no separate "skip" flag.
- `createQueryOptionsWithParams` returns only `queryKey` and `queryFn`; spread extra TanStack options in yourself if you need them: `{ ...createQueryOptionsWithParams(...), staleTime: 60_000 }`.
- `buildUrlWithParams` returns the base URL unchanged when nothing is produced, and picks `&` over `?` when the URL already contains a `?`.
- `null`/`undefined` params are skipped, `$type` is ignored, and circular references throw `Error: Circular reference detected at key: <key>` while the URL is being built.
- Keys are encoded, so bracket characters appear as `%5B`/`%5D` in the final URL.

---

## 🔗 Related packages

- SWR instead of TanStack Query: [`-react-swr`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
- Other adapters: [`-fetch`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch), [`-axios`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios), [`-angular`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular), [`-angular-resource`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource)
- Key formatting: `-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`
- Values: `-value-from-*` and `-value-to-*`

Full matrix and recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

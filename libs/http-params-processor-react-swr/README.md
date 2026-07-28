# ⚛️ @adaskothebeast/http-params-processor-react-swr

**The SWR adapter of [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): the flattened URL becomes the SWR key, so nested params cache and revalidate correctly.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-react-swr?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` and SWR; requests use the platform `fetch`. ESM only (`"type": "module"`). `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-react-swr @adaskothebeast/http-params-processor-core
```

Peer dependencies: `@adaskothebeast/http-params-processor-core ^12.0.0`, `swr ^2.3.8`.

---

## 🎯 What it does

`useSWRWithParams` flattens `params` under `paramsKey`, appends the query string to `url`, and passes that **complete URL string as the SWR key**:

```text
url:      /api/users
key:      /api/users?filter.status=active
fetcher:  GET on that key
```

Because the key is a string derived from the serialized params, cache identity is exact and stable across renders with no memoization needed.

---

## 🧰 API

| Export                                                          | Returns                           | Notes                                                    |
| --------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------- |
| `useSWRWithParams<TData, TError>(options)`                      | `SWRResponse<TData, TError>`      | Hook; wraps `useSWR(fullUrl, fetcher, swrOptions)`       |
| `createSWRKey(url, paramsKey, params, processorOptions?)`       | `Key`                             | The same string key, for manual `useSWR`/`mutate` calls  |
| `createFetcherWithParams<TData>(options)`                       | `(url: string) => Promise<TData>` | A fetcher that appends the params to the URL it receives |
| `buildUrlWithParams(url, paramsKey, params, processorOptions?)` | `string`                          | The URL builder used internally                          |
| `getProcessedUrl(url, paramsKey, params, processorOptions?)`    | `string`                          | Alias of `buildUrlWithParams`, handy for debugging       |

### Options

`UseSWRWithParamsOptions<TData, TError>`:

| Option             | Type                              | Default             |
| ------------------ | --------------------------------- | ------------------- |
| `url`              | `string`                          | required            |
| `paramsKey`        | `string`                          | required            |
| `params`           | `Record<string, unknown>`         | required            |
| `processorOptions` | `SWRParamsProcessorOptions`       | core defaults       |
| `swrOptions`       | `SWRConfiguration<TData, TError>` | SWR defaults        |
| `fetchFn`          | `typeof fetch`                    | global `fetch`      |
| `fetchOptions`     | `RequestInit`                     | `{ method: 'GET' }` |

`SWRParamsProcessorOptions` is `{ keyFormatter?, valueConverters? }`.

`createFetcherWithParams` takes `{ paramsKey, params, processorOptions?, fetchFn?, fetchOptions? }`.

---

## ⚡ Usage

```tsx
import { useSWRWithParams } from '@adaskothebeast/http-params-processor-react-swr';

function Users() {
  const { data, error, isLoading, mutate } = useSWRWithParams<User[]>({
    url: '/api/users',
    paramsKey: 'filter',
    params: {
      status: 'active',
      roles: ['admin', 'user'],
      dateRange: { from: new Date('2024-01-01'), to: new Date('2024-12-31') },
    },
    swrOptions: { revalidateOnFocus: false, keepPreviousData: true },
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <UserList users={data ?? []} onRefresh={() => mutate()} />;
}
```

Wiring SWR yourself, for example to support conditional fetching:

```ts
import { createSWRKey } from '@adaskothebeast/http-params-processor-react-swr';
import useSWR from 'swr';

const key = enabled ? createSWRKey('/api/users', 'filter', { status }) : null;

const { data } = useSWR<User[]>(key, (url: string) => fetch(url).then((r) => r.json()));
```

Reusing the fetcher with a **base** URL as the key:

```ts
import { createFetcherWithParams } from '@adaskothebeast/http-params-processor-react-swr';
import useSWR from 'swr';

const fetcher = createFetcherWithParams<User[]>({
  paramsKey: 'filter',
  params: { status: 'active' },
  fetchOptions: { credentials: 'include' },
});

const { data } = useSWR<User[]>('/api/users', fetcher);
```

Invalidating a specific entry:

```ts
import { mutate } from 'swr';

await mutate(createSWRKey('/api/users', 'filter', { status: 'active' }));
```

---

## 🎛️ Options and configuration

```ts
import { FlatKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-flat';

useSWRWithParams<User[]>({
  url: '/api/users',
  paramsKey: 'filter',
  params: { user: { name: 'John' } },
  processorOptions: { keyFormatter: new FlatKeyFormattingStrategy('_') },
});
// /api/users?filter_user_name=John
```

`processorOptions` is per call; there is no provider or global registry. A fresh `ParamsProcessor` is created inside `buildUrlWithParams` each time, so the options object is the only place configuration lives. `swrOptions` is forwarded to `useSWR` untouched, so all of SWR's configuration (dedupe interval, refresh interval, `fallbackData`, `onError`, …) applies.

Providing `valueConverters` replaces the core defaults, so include a `Date` converter if you still pass native dates.

---

## 📤 Output examples

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

createSWRKey('/api/users', 'filter', { status: 'active' });
// '/api/users?filter.status=active'
```

---

## ⚠️ Edge cases

- The hook's key is a **string**, never `null`, so `useSWRWithParams` always fetches. For conditional fetching, build the key with `createSWRKey` and pass `null` to `useSWR` yourself, as shown above.
- Do **not** feed a `createSWRKey` result into `createFetcherWithParams`. That fetcher appends the params again to whatever URL it receives, and since the URL already contains a `?`, you would get the parameters twice. Pair the fetcher with the plain base URL.
- Non-`ok` responses throw `Error: HTTP error! status: <status>`; the body is not read, so parse errors yourself through `fetchFn` if you need details.
- The response is always parsed with `response.json()`. Endpoints returning `204 No Content` or text will reject.
- `fetchOptions` is spread **after** `method: 'GET'`, so passing `method` there overrides the verb (params still go in the query string, not the body).
- Keys are compared as strings, so two params objects that serialize identically share one cache entry, while property reordering produces a different key and therefore a separate entry.
- `buildUrlWithParams` returns the base URL unchanged when nothing is produced, and picks `&` over `?` when the URL already contains a `?`.
- `null`/`undefined` params are skipped, `$type` is ignored, and circular references throw `Error: Circular reference detected at key: <key>` while the URL is being built (during render, since the key is computed eagerly).
- Keys are encoded, so bracket characters appear as `%5B`/`%5D` in the final URL and in the SWR key.

---

## 🔗 Related packages

- TanStack Query instead of SWR: [`-react-tanstack-query`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
- Other adapters: [`-fetch`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch), [`-axios`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios), [`-angular`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular), [`-angular-resource`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource)
- Key formatting: `-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`
- Values: `-value-from-*` and `-value-to-*`

Full matrix and recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

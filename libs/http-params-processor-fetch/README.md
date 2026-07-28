# 🌐 @adaskothebeast/http-params-processor-fetch

**The `fetch` adapter of [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): URL builders and `URLSearchParams` factories for deeply nested query objects.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-fetch?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core`; it only uses the platform `URL` and `URLSearchParams`. ESM only (`"type": "module"`). `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-fetch @adaskothebeast/http-params-processor-core
```

Peer dependencies: `@adaskothebeast/http-params-processor-core ^12.0.0`. Nothing else - `fetch` is part of the platform.

---

## 🎯 What it does

`FetchParamsProcessor` flattens a nested object into query parameters and then hands you the exact shape you need at the call site:

| You need                          | Method              |
| --------------------------------- | ------------------- |
| a ready-to-fetch URL string       | `buildUrl`          |
| a `URL` instance                  | `buildUrlObject`    |
| a query string without `?`        | `toQueryString`     |
| a `URLSearchParams` body          | `toURLSearchParams` |
| to extend params you already have | `appendTo`          |

---

## 🧰 API

### `FetchParamsProcessor`

| Member                                         | Returns                | Notes                                                       |
| ---------------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `new FetchParamsProcessor(config?)`            | -                      | `config` sets instance-wide defaults                        |
| `createFetchParamsProcessor(config?)`          | `FetchParamsProcessor` | Factory helper, identical to the constructor                |
| `toURLSearchParams(key, obj, options?)`        | `URLSearchParams`      | Built with `append`, so repeated keys survive               |
| `toQueryString(key, obj, options?)`            | `string`               | `encodeURIComponent`-encoded, **no** leading `?`            |
| `buildUrl(baseUrl, key, obj, options?)`        | `string`               | Adds `?` or `&` depending on the base URL                   |
| `buildUrlObject(baseUrl, key, obj, options?)`  | `URL`                  | Accepts a `string` or a `URL`, keeps existing search params |
| `appendTo(existingParams, key, obj, options?)` | `URLSearchParams`      | Mutates and returns the **same** instance you passed in     |
| `coreProcessor`                                | `ParamsProcessor`      | Getter for the underlying core instance                     |

### Standalone helpers

| Function                                    | Returns           |
| ------------------------------------------- | ----------------- |
| `buildFetchUrl(baseUrl, key, obj, config?)` | `string`          |
| `toFetchParams(key, obj, config?)`          | `URLSearchParams` |

Both create a throwaway processor per call, so prefer an instance in hot paths.

### Types

`FetchParamsProcessorConfig` (`{ keyFormatter?, valueConverters? }`). Per-call `options` use the core `ParamsProcessorOptions`.

### Re-exports from `core`

Values: `ValueConverter`, `createValueConverter`, `DefaultKeyFormattingStrategy`, `DefaultDateValueFromStrategy`, `DefaultDateValueToStrategy`, `DefaultPrimitiveValueToStrategy`.
Types: `ParamsProcessorOptions`, `ProcessableInput`, `ParamsEntry`, `IKeyFormattingStrategy`, `IValueConverter`, `IValueFromStrategy`, `IValueToStrategy`, `DurationComponents`, `PeriodComponents`.

---

## ⚡ Usage

```ts
import { createFetchParamsProcessor } from '@adaskothebeast/http-params-processor-fetch';

const processor = createFetchParamsProcessor();

const url = processor.buildUrl('/api/products', 'filter', {
  category: 'electronics',
  price: { min: 100, max: 500 },
});
// /api/products?filter.category=electronics&filter.price.min=100&filter.price.max=500

const res = await fetch(url);
```

As a form encoded body:

```ts
const body = processor.toURLSearchParams('filter', { status: 'active' });

await fetch('/api/search', { method: 'POST', body });
```

Merging into pagination params you already built:

```ts
const params = new URLSearchParams({ page: '1', size: '10' });
processor.appendTo(params, 'filter', { status: 'active' });
// page=1&size=10&filter.status=active

await fetch(`/api/data?${params}`);
```

Absolute URLs as objects, and the one-liners:

```ts
import { buildFetchUrl, toFetchParams } from '@adaskothebeast/http-params-processor-fetch';

const target = processor.buildUrlObject('https://api.example.com/products', 'filter', { category: 'electronics' });
await fetch(target);

await fetch(buildFetchUrl('/api/products', 'filter', { inStock: true }));
await fetch(`/api/data?${toFetchParams('filter', { status: 'active' })}`);
```

---

## 🎛️ Options and configuration

```ts
import { createFetchParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-fetch';
import { FlatKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-flat';

const processor = createFetchParamsProcessor({
  keyFormatter: new FlatKeyFormattingStrategy('_'),
});

processor.toQueryString('filter', { status: 'active' });
// filter_status=active
```

Every method also takes a per-call `options` argument (`{ keyFormatter?, valueConverters? }`) that overrides the instance defaults for that call. `buildFetchUrl` and `toFetchParams` accept the same shape as their last argument instead, because they construct the processor for you.

Providing `valueConverters` replaces the core defaults, so re-register a `Date` converter if you still pass native dates.

---

## 📤 Output examples

```ts
const processor = new FetchParamsProcessor();

processor.toQueryString('filter', { name: 'John Doe', status: 'active' });
// filter.name=John%20Doe&filter.status=active

processor.toQueryString('filter', { query: 'a=b&c=d' });
// filter.query=a%3Db%26c%3Dd

processor.buildUrl('/api/products', 'filter', { status: 'active' });
// /api/products?filter.status=active

processor.buildUrl('/api/products?page=1', 'filter', { status: 'active' });
// /api/products?page=1&filter.status=active

processor.buildUrl('/api/products', 'filter', { a: null, b: undefined });
// /api/products

processor.toURLSearchParams('items', ['a', 'b', 'c']).get('items[1]');
// 'b'

processor.toURLSearchParams('filter', { createdAt: new Date('2024-01-01T00:00:00.000Z') }).get('filter.createdAt');
// '2024-01-01T00:00:00.000Z'
```

---

## ⚠️ Edge cases

- `buildUrl` returns the base URL **unchanged** when the object produces no entries (all `null`/`undefined`, or an empty object/array), so you never get a dangling `?`.
- The separator is chosen with `baseUrl.includes('?')`. A base URL that already ends in `?` or `&` will therefore get another `&` appended.
- `buildUrlObject` goes through `new URL(...)`, which **requires an absolute URL**; relative paths like `/api/products` throw. Use `buildUrl` for relative URLs.
- `appendTo` mutates the instance you pass in and returns that very instance, and it always **appends**, so calling it twice with the same key duplicates the entries.
- `toQueryString` encodes with `encodeURIComponent` (space becomes `%20`), while `String(urlSearchParams)` encodes space as `+`. Both are valid in a query string, but the two helpers do not produce byte-identical output.
- Values coming out of `toURLSearchParams` are **not** double-encoded: `get()` returns the decoded value (`2024-01-01T00:00:00.000Z`).
- `null` and `undefined` are skipped at every depth, `$type` is ignored, and circular references throw `Error: Circular reference detected at key: <key>`.
- Unmatched values fall back to `String(value)`.
- Nothing here calls `fetch`; you stay in control of method, headers, credentials and error handling.

---

## 🔗 Related packages

- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
- Other adapters: [`-axios`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios), [`-angular`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular), [`-angular-resource`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource), [`-react-tanstack-query`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query), [`-react-swr`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr)
- Key formatting: `-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`
- Values: `-value-from-*` and `-value-to-*`

Full matrix and recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

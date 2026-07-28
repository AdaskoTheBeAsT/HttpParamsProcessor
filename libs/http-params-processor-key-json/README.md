# 🧾 @adaskothebeast/http-params-processor-key-json

**One parameter, one JSON string: [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor) stops flattening and sends `filter={"status":"active","count":5}` instead.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-key-json?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-json)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` (its only peer dependency, `^12.0.0`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-key-json @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

Every other key strategy changes how nested keys are **spelled**. This one opts out of flattening entirely: it implements the optional `transformComplexObject` hook of `IKeyFormattingStrategy`, and because that hook returns a non-`null` appender, `ParamsProcessor` short-circuits its recursion and emits a single pair whose value is `JSON.stringify(obj)`.

| Input                                        | `DefaultKeyFormattingStrategy` (core) | `JsonKeyFormattingStrategy`            |
| -------------------------------------------- | ------------------------------------- | -------------------------------------- |
| `{ status: 'active', count: 5 }` at `filter` | `filter.status`, `filter.count`       | `filter={"status":"active","count":5}` |
| `['a', 'b', 'c']` at `tags`                  | `tags[0]`, `tags[1]`, `tags[2]`       | `tags=["a","b","c"]`                   |

Use it when the endpoint expects a JSON blob in the query string (search DSLs, GraphQL-ish `variables`, OData-like `$filter` replacements, or your own `?filter=` convention) and you do not want to call `JSON.stringify` by hand at every call site.

---

## 🧰 API

### `JsonKeyFormattingStrategy`

Implements `IKeyFormattingStrategy` from `core`.

| Member                                     | Returns            | Result                                             |
| ------------------------------------------ | ------------------ | -------------------------------------------------- |
| `new JsonKeyFormattingStrategy()`          | -                  | No constructor options                             |
| `formatObjectKey(parentKey, propertyKey)`  | `string`           | `` `${parentKey}.${propertyKey}` `` (dot notation) |
| `formatArrayKey(parentKey, index)`         | `string`           | `` `${parentKey}[${index}]` ``                     |
| `transformComplexObject(params, key, obj)` | `T` (never `null`) | `params.append(key, JSON.stringify(obj))`          |

`params` is an `IParamsAppender` (a minimal `append(key, value)` sink supplied by `core`); `obj` is `Record<string, unknown> | unknown[]`.

Because `transformComplexObject` never returns `null`, `formatObjectKey` and `formatArrayKey` are effectively unreachable when the strategy is driven by `ParamsProcessor` - they exist so the class satisfies the interface (and mirror the core defaults if you call them directly).

---

## ⚡ Usage

```ts
import { ParamsProcessor } from '@adaskothebeast/http-params-processor-core';
import { JsonKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-json';

const processor = new ParamsProcessor({
  keyFormatter: new JsonKeyFormattingStrategy(),
});

processor.process('filter', { status: 'active', count: 5 });
// [['filter', '{"status":"active","count":5}']]

processor.toQueryString('filter', { status: 'active', count: 5 });
// filter=%7B%22status%22%3A%22active%22%2C%22count%22%3A5%7D
```

The same `keyFormatter` option is accepted by every adapter (`-angular`, `-angular-resource`, `-fetch`, `-axios`, `-react-tanstack-query`, `-react-swr`), because they all forward their options object to `ParamsProcessor`.

Mixing shapes per request is easy, since `keyFormatter` can also be passed per call:

```ts
const processor = new ParamsProcessor();
const json = new JsonKeyFormattingStrategy();

processor.toQueryString('page', { page: 2 }); // page.page=2  (dot notation)
processor.toQueryString('filter', { status: 'active' }, { keyFormatter: json }); // filter=%7B%22status%22%3A%22active%22%7D
```

---

## 🎛️ Options and configuration

No constructor options: the output is whatever `JSON.stringify` produces, with no replacer, no indentation and no custom key ordering (properties keep insertion order).

Shape the payload before handing it over if you need control:

```ts
processor.process('filter', {
  status: 'active',
  from: new Date('2024-01-15T10:30:00Z').toISOString(),
});
// [['filter', '{"status":"active","from":"2024-01-15T10:30:00.000Z"}']]
```

Registering `valueConverters` does **not** affect the JSON blob (see edge cases), so pre-serialize dates, decimals and UUIDs yourself when using this strategy.

---

## 📤 Output examples

```ts
const strategy = new JsonKeyFormattingStrategy();
const processor = new ParamsProcessor({ keyFormatter: strategy });
```

```text
process('filter', { status: 'active', count: 5 })
  filter = {"status":"active","count":5}

process('tags', ['a', 'b', 'c'])
  tags   = ["a","b","c"]

process('data', { user: { name: 'John', age: 30 }, active: true })
  data   = {"user":{"name":"John","age":30},"active":true}

process('p', 'plain-value')
  p      = plain-value        (primitives are not JSON encoded)
```

```ts
processor.toPlainObject('data', { user: { name: 'John' } });
// { data: '{"user":{"name":"John"}}' }
```

---

## ⚠️ Edge cases

- **Primitives bypass the hook.** `transformComplexObject` only runs for objects and arrays, so `process('p', 'plain-value')` still yields `[['p', 'plain-value']]` (no surrounding quotes).
- **Value converters never see the inside of the blob.** `JSON.stringify` handles nested values itself, so `Date` becomes an ISO string via `toJSON`, a `Uint8Array` becomes `{"0":…}` and `decimal.js` values use their own `toJSON`. Only a non-plain object passed as the **root** is converted, because `core` offers such roots to the converters before calling the hook.
- **Core's traversal rules do not apply inside the blob**: `undefined` properties are dropped by `JSON.stringify` (as are functions and symbols), `null` is kept as `null`, a `$type` discriminator is kept, and `{}` / `[]` still emit a pair (`p={}`, `p=[]`) instead of nothing.
- **Circular references throw `TypeError: Converting circular structure to JSON`** from `JSON.stringify`, not the `Error: Circular reference detected at key: <key>` you get from `core`, because the hook runs before the cycle check.
- `BigInt` values make `JSON.stringify` throw `TypeError: Do not know how to serialize a BigInt`.
- The whole payload lands in one parameter value, so it is percent encoded in full: expect long URLs and check your server's query string limit (often 2 - 8 KB). Consider `POST` for large filters.
- The backend must `JSON.parse` the value itself; no model binder will do it for you, and the parameter is opaque to caches and gateway rules that inspect individual query parameters.

---

## 🔗 Related packages

- Flattening strategies: [`-key-bracket-notation`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-bracket-notation) (`user[name]`), [`-key-rails`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails) (`items[]`), [`-key-flat`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-flat) (`user_name`), [`-key-custom-delimiter`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-custom-delimiter) (`user:name`)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core) (`IKeyFormattingStrategy`, `IParamsAppender`)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

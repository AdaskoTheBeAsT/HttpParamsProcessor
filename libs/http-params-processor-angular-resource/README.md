# 🅰️ @adaskothebeast/http-params-processor-angular-resource

**Signal driven `httpResource` helpers for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): declare a nested params object and get a reactive Angular resource that reloads itself.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-angular-resource?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Built on top of the `-angular` package and Angular's own `httpResource`. Published in Angular Package Format (ESM). `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-angular-resource @adaskothebeast/http-params-processor-angular @adaskothebeast/http-params-processor-core
```

Peer dependencies: `@adaskothebeast/http-params-processor-angular ^12.0.0`, `@angular/common >=22.0.8`, `@angular/core >=22.0.8`.

This package depends on the **`-angular`** package (it injects `HttpParamsProcessorService`), not on `core` directly. `core` still has to be installed because `-angular` requires it.

---

## 🎯 What it does

`httpResourceWithParams` wraps `httpResource` and does three things for you:

1. reads `url` and `paramsValue` inside the resource's request function, so any signal you touch there becomes a dependency,
2. flattens the params object with `HttpParamsProcessorService.process(paramsKey, value)`,
3. copies the resulting `HttpParams` into the `params` record of an `HttpResourceRequest`.

You get a plain `HttpResourceRef<T>` back, with the usual `value()`, `status()`, `isLoading()`, `error()` and `reload()`.

---

## 🧰 API

| Export                                          | Signature                                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `httpResourceWithParams<T>(options)`            | `HttpResourceRef<T>` when `defaultValue` is given, otherwise `HttpResourceRef<T \| undefined>` |
| `reactiveHttpResourceWithParams<T, P>(options)` | Same, with a `params: () => P \| undefined` shorthand instead of `paramsValue`                 |

Types: `HttpResourceWithParamsOptions<TResult, TRaw>`, `ReactiveHttpResourceWithParamsOptions<T, P>` (which is `Omit<HttpResourceWithParamsOptions<T>, 'paramsValue'>` plus `params`).

### Options

| Option             | Type                                                                                           | Default          |
| ------------------ | ---------------------------------------------------------------------------------------------- | ---------------- |
| `url`              | `string \| (() => string \| undefined)`                                                        | required         |
| `paramsKey`        | `string`                                                                                       | required         |
| `paramsValue`      | `Signal<Record<string, unknown> \| undefined> \| (() => Record<string, unknown> \| undefined)` | required         |
| `processorOptions` | `HttpParamsProcessorOptions` (`keyFormatter`, `valueConverters`)                               | service defaults |
| `additionalParams` | `Record<string, string \| string[]>`                                                           | none             |
| `method`           | `string`                                                                                       | `'GET'`          |
| `headers`          | `Record<string, string \| string[]> \| (() => Record<string, string \| string[]>)`             | none             |
| `body`             | `unknown`                                                                                      | omitted          |
| `reportProgress`   | `boolean`                                                                                      | omitted          |
| `withCredentials`  | `boolean`                                                                                      | omitted          |
| `defaultValue`     | `TResult`                                                                                      | none             |
| `equal`            | `(a: TResult, b: TResult) => boolean`                                                          | Angular default  |
| `map`              | `(value: TRaw) => TResult`                                                                     | none             |
| `injector`         | `Injector`                                                                                     | the ambient one  |

---

## ⚡ Usage

```ts
import { httpResourceWithParams } from '@adaskothebeast/http-params-processor-angular-resource';
import { Component, signal } from '@angular/core';

@Component({ selector: 'app-users', template: '...' })
export class UsersComponent {
  readonly status = signal('active');

  readonly users = httpResourceWithParams<User[]>({
    url: '/api/users',
    paramsKey: 'filter',
    paramsValue: () => ({ status: this.status(), roles: ['admin', 'user'] }),
    defaultValue: [],
  });
}

// users.value(), users.isLoading(), users.error(); reloads when `status` changes
this.status.set('inactive');
```

`reactiveHttpResourceWithParams` is the same call with a `params` function, which reads slightly better when every field comes from a signal:

```ts
const statusFilter = signal('active');
const roleFilter = signal(['admin']);

const users = reactiveHttpResourceWithParams<User[], FilterParams>({
  url: '/api/users',
  paramsKey: 'filter',
  params: () => ({ status: statusFilter(), roles: roleFilter() }),
});
```

Conditional loading, static extras, a different verb and response mapping:

```ts
const selectedId = signal<number | undefined>(undefined);

const detail = httpResourceWithParams<UserDto, RawUserDto>({
  url: () => (selectedId() === undefined ? undefined : '/api/users/detail'),
  paramsKey: 'filter',
  paramsValue: () => ({ id: selectedId() }),
  additionalParams: { page: '1', size: '10' },
  headers: { 'X-Custom-Header': 'custom-value' },
  method: 'POST',
  body: { action: 'search' },
  map: (raw) => toUserDto(raw),
});
```

---

## 🎛️ Options and configuration

`processorOptions` is forwarded verbatim to `HttpParamsProcessorService.process`, so you can override the key formatter or value converters per resource:

```ts
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';

httpResourceWithParams<User[]>({
  url: '/api/users',
  paramsKey: 'filter',
  paramsValue: () => ({ status: 'active' }),
  processorOptions: {
    keyFormatter: new BracketNotationKeyFormattingStrategy(),
  },
});
```

Application-wide defaults still come from the `-angular` DI tokens `HTTP_PARAMS_KEY_FORMATTER` and `HTTP_PARAMS_VALUE_CONVERTERS`.

---

## 📤 Output examples

For `paramsKey: 'filter'` and `paramsValue: () => ({ status: 'active', roles: ['admin', 'user'] })` the generated `HttpResourceRequest` is:

```text
url:    /api/users
method: GET
params: {
  'filter.status':   'active',
  'filter.roles[0]': 'admin',
  'filter.roles[1]': 'user'
}
```

A single value per key becomes a `string`, a key with several values becomes a `string[]`, and `additionalParams` are spread in first:

```text
additionalParams { page: '1' } + { status: 'active' }
  => { page: '1', 'filter.status': 'active' }
```

---

## ⚠️ Edge cases

- Both functions call `inject`, so they must run in an **injection context** (field initializer, constructor, or `runInInjectionContext`). Pass `injector` explicitly when you construct a resource later.
- If the `url` function returns `undefined`, the request function returns `undefined` and the resource stays in `status() === 'idle'`. Same when `paramsValue` returns `undefined`; this is the supported way to defer a request.
- `paramsValue` returning `{}` is **not** idle: an empty params object produces an empty `params` record and the request is sent.
- Processed params are written into the record **after** `additionalParams`, so a processed key wins if it collides with a static one.
- `defaultValue` is only forwarded when it is not `undefined`; use `null` or an empty array if you need an explicit "no data yet" value.
- Encoding is Angular's job: the flattened keys go into `HttpResourceRequest.params` as raw strings and `HttpClient` encodes them.
- The same behaviour guarantees as the `-angular` service apply to the params object: `null`/`undefined` skipped, `$type` ignored, circular references throw `Circular reference detected at key: <key>` from inside the request function.
- `reactiveHttpResourceWithParams` is a thin delegation (`paramsValue: options.params`), so anything valid for `httpResourceWithParams` is valid there too.

---

## 🔗 Related packages

- `HttpClient` based service: [`-angular`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
- Other adapters: [`-fetch`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch), [`-axios`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios), [`-react-tanstack-query`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query), [`-react-swr`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr)
- Key formatting: `-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`

Full matrix and recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

<div align="center">

# 🧩 HttpParamsProcessor

**Turn deeply nested JavaScript objects into query strings your backend actually understands.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-core?label=core&color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-angular?label=angular&color=dd0031&logo=angular)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular)
[![CI](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor/actions/workflows/ci.yml/badge.svg)](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Nx](https://img.shields.io/badge/maintained%20with-nx-143055?logo=nx)](https://nx.dev)

</div>

---

## 🤔 The problem

You have a rich filter object on the client:

```ts
const query = {
  arr: [
    { id: '1', innerArr: [{ id: '1.1', text: 'first first' }] },
    { id: '2', innerArr: [{ id: '2.1', text: 'second first' }] },
  ],
};
```

…and an endpoint that wants to model-bind it straight into a class (ASP.NET Core, Rails, PHP, Spring, you name it).
`HttpParams`, `URLSearchParams`, `axios` and friends all happily flatten primitives, and then give up on nested objects and arrays.

**HttpParamsProcessor** walks the whole object graph and emits exactly the keys your server expects:

```text
/api/endpoint?p.arr[0].id=1&p.arr[0].innerArr[0].id=1.1&p.arr[0].innerArr[0].text=first%20first&p.arr[1].id=2&…
```

That URL binds automatically to a strongly typed parameter on the backend. No manual string building. No `JSON.stringify` hacks (unless you _want_ them 😉).

---

## ✨ Highlights

- 🧠 **Recursive by design** – objects in arrays in objects in arrays, any depth.
- 🎯 **Framework agnostic core** – zero runtime dependencies, works anywhere JS runs.
- 🔌 **Adapters everywhere** – Angular `HttpParams`, Angular `httpResource`, `fetch`, `axios`, TanStack Query, SWR.
- 🔤 **Pluggable key formatting** – dot, bracket/PHP, Rails, flat, custom delimiter, or full JSON.
- 🕰️ **Pluggable value conversion** – a two-stage `from → to` pipeline for dates, durations, periods, decimals and UUIDs.
- 📅 **Date library friendly** – Day.js, Luxon, Moment, js-joda in; ISO 8601, NodaTime, Unix/ms timestamps, date-fns formats out.
- 💯 **Lossless numbers & ids** – `decimal.js` values and UUID bytes serialize without precision loss or guesswork.
- 🧱 **Tiny, tree-shakeable packages** – install only what you use (`sideEffects: false`, ESM + CJS; Angular packages ship FESM2022).
- 🛡️ **Safe** – `null`/`undefined` are skipped, `$type` discriminators are ignored, circular references throw instead of hanging.
- ✅ **Fully typed & tested** – 25 packages, 38 spec files, 290+ unit tests.

---

## 📦 Packages

All packages are published under the `@adaskothebeast/` scope and share the same version.

> 📖 The tables below link to npm. Every package also ships its **own README** with its full API, options, output examples and edge cases - browse them under [`libs/<package-name>/README.md`](./libs) (that is exactly what you see on its npm page).

### Core & HTTP clients

| Package                                                                                                                                  | What it gives you                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`http-params-processor-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)                                 | `ParamsProcessor` – entries, query string, `URLSearchParams`, plain object. Zero deps.      |
| [`http-params-processor-angular`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular)                           | `HttpParamsProcessorService` returning Angular `HttpParams` + DI tokens.                    |
| [`http-params-processor-angular-resource`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource)         | `httpResourceWithParams()` / `reactiveHttpResourceWithParams()` for signal-based resources. |
| [`http-params-processor-fetch`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch)                               | `FetchParamsProcessor` – `buildUrl`, `toURLSearchParams`, `appendTo`.                       |
| [`http-params-processor-axios`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios)                               | `AxiosParamsProcessor` – drop-in `paramsSerializer`.                                        |
| [`http-params-processor-react-tanstack-query`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query) | `useQueryWithParams()`, `createQueryOptionsWithParams()`.                                   |
| [`http-params-processor-react-swr`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr)                       | `useSWRWithParams()`, `createFetcherWithParams()`, `createSWRKey()`.                        |

### 🔤 Key formatting strategies

| Package                                                                                                              | Class                                  | `user` + `name`              | `items` + `0`            |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------- | ------------------------ |
| _(built into core)_                                                                                                  | `DefaultKeyFormattingStrategy`         | `user.name`                  | `items[0]`               |
| [`…-key-bracket-notation`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-bracket-notation) | `BracketNotationKeyFormattingStrategy` | `user[name]`                 | `items[0]`               |
| [`…-key-rails`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails)                       | `RailsKeyFormattingStrategy`           | `user[name]`                 | `items[]`                |
| [`…-key-flat`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-flat)                         | `FlatKeyFormattingStrategy`            | `user_name`                  | `items_0`                |
| [`…-key-custom-delimiter`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-custom-delimiter) | `CustomDelimiterKeyFormattingStrategy` | `user:name`                  | `items[0]`               |
| [`…-key-json`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-json)                         | `JsonKeyFormattingStrategy`            | `filter={"status":"active"}` | _(whole object as JSON)_ |

`FlatKeyFormattingStrategy` takes a `separator` (default `'_'`), which applies to array indices as well: `new FlatKeyFormattingStrategy('-')` → `user-name`, `items-0`.
`CustomDelimiterKeyFormattingStrategy(objectDelimiter = ':', arrayFormat: 'bracket' | 'delimiter' = 'bracket')` → `new CustomDelimiterKeyFormattingStrategy('->', 'delimiter')` gives `user->name` and `items->2`.
`RailsKeyFormattingStrategy(arrayFormat: 'brackets' | 'indexed' = 'brackets')` emits idiomatic empty brackets (`items[]`, `arr[][id]`), which `Rack::Utils.parse_nested_query` groups positionally: `arr[][id]=1&arr[][id]=2` → `[{ id: 1 }, { id: 2 }]`. Rack cannot disambiguate arrays nested directly inside array elements that way, so pass `new RailsKeyFormattingStrategy('indexed')` for those payloads to get explicit `items[0]` indices.
`JsonKeyFormattingStrategy` serializes the whole subtree with `JSON.stringify` before core traverses it, so it behaves differently from the others: registered value converters do not apply to nested values, `$type` is kept, empty objects and arrays still emit a pair (`p={}`, `p=[]`), and circular input throws `TypeError: Converting circular structure to JSON` instead of the usual `Circular reference detected at key: …`.

### 🕰️ Value strategies

Value conversion is a **two-stage pipeline**: a _value-from_ strategy normalizes a library type into a neutral shape (`Date`, `DurationComponents`, `PeriodComponents`), and a _value-to_ strategy renders that shape as a string. Mix and match freely.

**Inputs** (`value-from`)

| Package                                                                                                          | Classes                                                                                                | Accepts → produces                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| [`…-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs)     | `DayjsDateValueFromStrategy`, `DayjsDurationValueFromStrategy`                                         | `Dayjs` → `Date`, `Duration` → `DurationComponents`                                                                    |
| [`…-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon)     | `LuxonDateTimeValueFromStrategy`, `LuxonDurationValueFromStrategy`                                     | `DateTime` → `Date`, `Duration` → `DurationComponents`                                                                 |
| [`…-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment)   | `MomentDateValueFromStrategy`, `MomentDurationValueFromStrategy`                                       | `Moment` → `Date`, `Duration` → `DurationComponents`                                                                   |
| [`…-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda) | `JsJodaLocalDateValueFromStrategy`, `JsJodaDurationValueFromStrategy`, `JsJodaPeriodValueFromStrategy` | `LocalDate`/`LocalDateTime`/`ZonedDateTime` → `Date`, `Duration` → `DurationComponents`, `Period` → `PeriodComponents` |
| [`…-value-from-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-decimal) | `DecimalValueFromStrategy`                                                                             | `decimal.js` `Decimal` → `DecimalComponents`                                                                           |
| [`…-value-from-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-uuid)       | `UuidBytesValueFromStrategy`, `UuidStringValueFromStrategy`                                            | `Uint8Array(16)` → `UuidComponents`, UUID string → `UuidComponents`                                                    |
| _(built into core)_                                                                                              | `DefaultDateValueFromStrategy`                                                                         | `Date` → `Date`                                                                                                        |

**Outputs** (`value-to`)

| Package                                                                                                                    | Classes                                                                                                                                         | Example output                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`…-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso)                       | `IsoDateValueToStrategy`, `IsoDurationValueToStrategy`, `IsoPeriodValueToStrategy`                                                              | `2024-01-15T10:30:00.000Z`, `PT1H30M45S`, `P1Y6M15D`                                                                     |
| [`…-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime)             | `NodaTimeDateValueToStrategy`, `NodaTimeDurationValueToStrategy`, `NodaTimePeriodValueToStrategy`                                               | `2024-01-01T00:00:00.000Z`, `PT26H` (days folded into hours), `P1Y6M`                                                    |
| [`…-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp) | `UnixTimestampValueToStrategy`                                                                                                                  | `1704067200`                                                                                                             |
| [`…-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp)     | `MsTimestampValueToStrategy`                                                                                                                    | `1704067200123`                                                                                                          |
| [`…-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)             | `DateFnsValueToStrategy`                                                                                                                        | `2024-01-15` (any `date-fns` format string)                                                                              |
| [`…-value-to-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-decimal)               | `DecimalStringValueToStrategy`, `DecimalFixedValueToStrategy`, `DecimalNumberValueToStrategy`, `DecimalExponentialValueToStrategy`              | `125000000`, `12.50`, `12.5`, `1.25e+8`                                                                                  |
| [`…-value-to-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-uuid)                     | `CanonicalUuidValueToStrategy`, `NoDashUuidValueToStrategy`, `BracedUuidValueToStrategy`, `UrnUuidValueToStrategy`, `Base64UuidValueToStrategy` | `550e8400-e29b-41d4-a716-446655440000`, `550e8400e29b…`, `{550e8400-…}`, `urn:uuid:550e8400-…`, `VQ6EAOKbQdSnFkRmVUQAAA` |
| _(built into core)_                                                                                                        | `DefaultDateValueToStrategy`, `DefaultPrimitiveValueToStrategy`                                                                                 | `toISOString()`, `String(value)`                                                                                         |

---

## 🚀 Install

```bash
# Angular (HttpClient)
npm i @adaskothebeast/http-params-processor-angular @adaskothebeast/http-params-processor-core

# Angular signals / httpResource
npm i @adaskothebeast/http-params-processor-angular-resource @adaskothebeast/http-params-processor-angular @adaskothebeast/http-params-processor-core

# fetch
npm i @adaskothebeast/http-params-processor-fetch @adaskothebeast/http-params-processor-core

# axios
npm i @adaskothebeast/http-params-processor-axios @adaskothebeast/http-params-processor-core

# React + TanStack Query / SWR
npm i @adaskothebeast/http-params-processor-react-tanstack-query @adaskothebeast/http-params-processor-core
npm i @adaskothebeast/http-params-processor-react-swr @adaskothebeast/http-params-processor-core
```

Add the optional key/value strategy packages you need, e.g.:

```bash
npm i @adaskothebeast/http-params-processor-key-bracket-notation \
      @adaskothebeast/http-params-processor-value-from-luxon \
      @adaskothebeast/http-params-processor-value-to-iso

# decimal.js and UUID values
npm i @adaskothebeast/http-params-processor-value-from-decimal \
      @adaskothebeast/http-params-processor-value-to-decimal \
      @adaskothebeast/http-params-processor-value-from-uuid \
      @adaskothebeast/http-params-processor-value-to-uuid
```

> 💡 `core` is a **peer dependency** of every adapter and strategy package — always install it alongside.

### 🧷 Peer dependency notes

Each date/number strategy package declares the underlying library as a peer dependency — you install it yourself, at the version you already use. Most need nothing beyond that; the exceptions are listed below.

| Strategy package                          | Peer dependency        | Companion library needed?                                                                                                                                                          |
| ----------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value-from-dayjs`                        | `dayjs ^1.11.21`       | No. `DayjsDurationValueFromStrategy` uses `dayjs/plugin/duration`, which ships inside `dayjs` and is registered by the package itself.                                             |
| `value-from-luxon`                        | `luxon ^3.7.2`         | No runtime library. TypeScript consumers need `@types/luxon` (Luxon ships no bundled types). Time zones come from the runtime's `Intl` data.                                       |
| `value-from-moment`                       | `moment ^2.30.1`       | No. Add `moment-timezone` only if _your_ code builds moments in named IANA zones.                                                                                                  |
| `value-from-js-joda`                      | `@js-joda/core ^6.1.0` | **Sometimes.** `@js-joda/core` only knows `UTC` and fixed offsets, so add `@js-joda/timezone` if you pass `ZonedDateTime` values built from IANA zone ids such as `Europe/Warsaw`. |
| `value-from-decimal` / `value-to-decimal` | `decimal.js ^10.6.0`   | No. Types are bundled.                                                                                                                                                             |
| `value-from-uuid`                         | `uuid ^14.0.1`         | No. Types are bundled. `value-to-uuid` has no runtime dependency at all.                                                                                                           |
| `value-to-date-fns`                       | `date-fns ^4.4.0`      | No. Locales/time zones are optional `date-fns` sub-imports you control.                                                                                                            |

`value-to-iso`, `value-to-nodatime`, `value-to-unix-timestamp` and `value-to-ms-timestamp` are dependency-free — they only need `core`.

> ⏳ **Temporal:** if you feed `Temporal` values in through a [custom strategy](#-write-your-own-strategy), `@js-temporal/polyfill` needs **no companion package**: types are bundled, time zones come from `Intl`, and its only dependency (`jsbi`) is installed transitively. On runtimes with native `Temporal` support you can drop the polyfill entirely.

---

## ⚡ Quick start

### 🅰️ Angular + `HttpClient`

```ts
import { HttpParamsProcessorService } from '@adaskothebeast/http-params-processor-angular';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebApiService {
  private readonly http = inject(HttpClient);
  private readonly processor = inject(HttpParamsProcessorService);

  getByQuery(query: ComplexParams) {
    const params: HttpParams = this.processor.process('p', query);

    return this.http.get<ResultDto>('api/endpoint', {
      headers: new HttpHeaders().set('Accept', 'application/json'),
      params,
    });
  }
}
```

Already have params? Append into them instead of starting fresh:

```ts
let params = new HttpParams().set('page', '1');
params = this.processor.processWithParams(params, 'p', query);
// page=1&p.arr[0].id=1&…
```

Configure the whole app once with DI tokens:

```ts
import { HTTP_PARAMS_KEY_FORMATTER, HTTP_PARAMS_VALUE_CONVERTERS, ValueConverter } from '@adaskothebeast/http-params-processor-angular';
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';
import { LuxonDateTimeValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { IsoDateValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-iso';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: HTTP_PARAMS_KEY_FORMATTER, useValue: new BracketNotationKeyFormattingStrategy() },
    {
      provide: HTTP_PARAMS_VALUE_CONVERTERS,
      useValue: [new ValueConverter(new LuxonDateTimeValueFromStrategy(), new IsoDateValueToStrategy())],
    },
  ],
});
```

<details>
<summary>Using NgModules? 📦</summary>

```ts
import { HttpParamsProcessorModule } from '@adaskothebeast/http-params-processor-angular';

@NgModule({ imports: [HttpParamsProcessorModule.forRoot()] })
export class AppModule {}
```

The service is `providedIn: 'root'`, so the module is optional.

</details>

### 🅰️ Angular signals + `httpResource`

```ts
import { httpResourceWithParams } from '@adaskothebeast/http-params-processor-angular-resource';

const status = signal('active');

const users = httpResourceWithParams<User[]>({
  url: '/api/users',
  paramsKey: 'filter',
  paramsValue: () => ({ status: status(), roles: ['admin', 'user'] }),
  defaultValue: [],
});

// users.value(), users.isLoading(), users.error() – reloads when `status` changes
status.set('inactive');
```

`reactiveHttpResourceWithParams()` is the same thing with a `params: () => …` shorthand, and both accept `additionalParams`, `headers`, `method`, `body`, `map`, `equal`, `injector` and `processorOptions`.

### 🌐 `fetch`

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

Other helpers: `toQueryString()`, `toURLSearchParams()`, `buildUrlObject()`, `appendTo(existingParams, …)`, plus the one-liners `buildFetchUrl()` and `toFetchParams()`.

### 🅰️ `axios`

```ts
import { createAxiosParamsProcessor } from '@adaskothebeast/http-params-processor-axios';

const processor = createAxiosParamsProcessor();

// Serialize the whole params object
await axios.get('/api/products', {
  params: { category: 'electronics', price: { min: 100 } },
  paramsSerializer: processor.createSerializer('filter'),
  // filter.category=electronics&filter.price.min=100
});

// …or pre-flatten into plain params
await axios.get('/api/products', {
  params: processor.toParams('filter', { user: { name: 'John' } }),
  // { 'filter.user.name': 'John' }
});
```

> ⚠️ Always pass a real root key. An empty string is **not** a "no prefix" shortcut: the key formatter still joins it with the first property, so the default dot formatter emits a leading delimiter (`.category=electronics`).

### ⚛️ React – TanStack Query

```ts
import { useQueryWithParams } from '@adaskothebeast/http-params-processor-react-tanstack-query';

const { data, isLoading } = useQueryWithParams<User[]>({
  queryKey: ['users'],
  url: '/api/users',
  paramsKey: 'filter',
  params: { status: 'active', roles: ['admin'] },
});
```

Need prefetching or shared config? `createQueryOptionsWithParams({ … })` returns a plain `queryOptions` object.

### ⚛️ React – SWR

```ts
import { useSWRWithParams } from '@adaskothebeast/http-params-processor-react-swr';

const { data, error, isLoading, mutate } = useSWRWithParams<User[]>({
  url: '/api/users',
  paramsKey: 'filter',
  params: { status: 'active', dateRange: { from: new Date('2024-01-01') } },
});
```

`createSWRKey()` and `createFetcherWithParams()` are there when you want to wire SWR yourself.

### 🧱 Core (anything else)

```ts
import { createParamsProcessor } from '@adaskothebeast/http-params-processor-core';

const processor = createParamsProcessor();

processor.process('p', query); // [['p.arr[0].id', '1'], …]
processor.toQueryString('p', query); // 'p.arr%5B0%5D.id=1&…'
processor.toURLSearchParams('p', query); // URLSearchParams
processor.toPlainObject('p', query); // { 'p.arr[0].id': '1', … }
```

---

## 🎛️ Configuration

Every entry point accepts the same options — globally in the constructor/DI, or per call:

```ts
processor.process('filter', query, {
  keyFormatter: new FlatKeyFormattingStrategy('_'),
  valueConverters: [new ValueConverter(new DayjsDateValueFromStrategy(), new UnixTimestampValueToStrategy()), new ValueConverter(new DayjsDurationValueFromStrategy(), new IsoDurationValueToStrategy())],
});
```

Converters are evaluated **in order** — the first whose `canHandle(value)` returns `true` wins. Anything unmatched falls back to `String(value)`.

Converters are also consulted **before** traversal for values that are neither arrays nor object literals, so class instances (`Date`, `Decimal`, `Uint8Array`, your own value objects) are serialized instead of being walked property by property.

### 💯 Decimals and UUIDs

```ts
import { ValueConverter, createParamsProcessor } from '@adaskothebeast/http-params-processor-core';
import { DecimalValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-decimal';
import { UuidBytesValueFromStrategy, UuidStringValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-uuid';
import { DecimalStringValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-decimal';
import { CanonicalUuidValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-uuid';
import Decimal from 'decimal.js';
import { parse } from 'uuid';

const processor = createParamsProcessor({
  valueConverters: [new ValueConverter(new DecimalValueFromStrategy(), new DecimalStringValueToStrategy()), new ValueConverter(new UuidBytesValueFromStrategy(), new CanonicalUuidValueToStrategy())],
});

processor.toQueryString('filter', {
  total: new Decimal('12345678901234567890.1234567890123456789'),
  tenantId: parse('550e8400-e29b-41d4-a716-446655440000'),
});
// filter.total=12345678901234567890.1234567890123456789&filter.tenantId=550e8400-e29b-41d4-a716-446655440000
```

- Decimals are normalized to a **lossless, non-exponential** literal, which is what ASP.NET Core, Rails and Spring decimal binders expect. Swap in `DecimalFixedValueToStrategy(2)` for money, `DecimalNumberValueToStrategy` for a numeric wire format, or `DecimalExponentialValueToStrategy` for scientific notation.
- Decimal-shaped **strings stay strings** — only real `Decimal` instances are converted, so `phone` and `postalCode` are never mangled.
- UUIDs are discriminated by type, not by content: `UuidBytesValueFromStrategy` handles 16 byte `Uint8Array` values (what `uuid`'s `parse()` returns), `UuidStringValueFromStrategy` handles canonical strings, and opt-in `forms` add braced, `urn:uuid:` and unhyphenated input. Pass `versions: [4]` to accept only specific UUID versions and `strict: true` to throw on invalid values instead of falling through.
- UUID bytes are RFC 4122 (big-endian) ordered — that is `uuid.parse()` order, **not** the mixed-endian layout of .NET `Guid.ToByteArray()`.

### 🎯 Pick the notation your backend speaks

| Backend                    | Strategy                               | Result            |
| -------------------------- | -------------------------------------- | ----------------- |
| ASP.NET Core model binding | `DefaultKeyFormattingStrategy`         | `p.arr[0].id=1`   |
| PHP / Laravel / Symfony    | `BracketNotationKeyFormattingStrategy` | `p[arr][0][id]=1` |
| Ruby on Rails              | `RailsKeyFormattingStrategy`           | `p[arr][][id]=1`  |
| Flat/legacy APIs           | `FlatKeyFormattingStrategy`            | `p_arr_0_id=1`    |
| Anything bespoke           | `CustomDelimiterKeyFormattingStrategy` | `p:arr[0]:id=1`   |
| APIs that want raw JSON    | `JsonKeyFormattingStrategy`            | `p={"arr":[…]}`   |

### 🧬 Write your own strategy

```ts
import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

export class DotOnlyKeyFormattingStrategy implements IKeyFormattingStrategy {
  formatObjectKey(parentKey: string, propertyKey: string) {
    return `${parentKey}.${propertyKey}`;
  }

  formatArrayKey(parentKey: string, index: number) {
    return `${parentKey}.${index}`;
  }
}
```

```ts
import { IValueFromStrategy, IValueToStrategy } from '@adaskothebeast/http-params-processor-core';

class UpperCaseValueToStrategy implements IValueToStrategy<string> {
  serializeValue(value: string) {
    return value.toUpperCase();
  }

  canHandle(value: unknown): value is string {
    return typeof value === 'string';
  }
}
```

Implement `transformComplexObject(params, key, obj)` on a key strategy to short-circuit recursion (that is exactly how the JSON strategy works); return `null` to fall back to normal traversal.

---

## 📐 Behaviour you can rely on

| Input                                     | Output                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `null` / `undefined` values               | 🚫 skipped entirely                                                    |
| `Date` (default converters)               | `toISOString()`                                                        |
| `$type` property                          | 🚫 skipped (JSON.NET/System.Text.Json discriminators stay client-side) |
| Circular reference                        | 💥 `Error: Circular reference detected at key: <key>`                  |
| Empty object / empty array                | no entries emitted                                                     |
| Duplicate keys in `toPlainObject()`       | collapsed into `string[]`                                              |
| Class instance with a matching converter  | converted, never traversed                                             |
| Class instance without matching converter | traversed like a plain object (`Map`, `Set` and `Blob` emit nothing)   |
| Unhandled primitive value type            | `String(value)` fallback                                               |

---

## 🧪 Working on this repo

Nx monorepo, Yarn 4, Vitest, esbuild + ng-packagr.

```bash
yarn install

yarn nx run-many -t test --all      # unit tests (290+)
yarn nx run-many -t lint --all      # eslint incl. dependency checks
yarn nx run-many -t build --all     # dist/libs/<package>
yarn nx graph                       # explore the workspace
```

Release helpers: `yarn setver` (sync versions from the root `package.json`), `yarn copyreadme` (fan this README + LICENSE out to every package), `yarn prerelease` (all of the above + build + test). Tagging `v*` triggers the npm publish workflow.

---

## 🧭 Compatibility

|                    | Requirement                                                       |
| ------------------ | ----------------------------------------------------------------- |
| Node.js            | 20+ (CI runs 24)                                                  |
| TypeScript         | 5.x and 6.x (repo builds with 6.0)                                |
| Angular packages   | `@angular/core` & `@angular/common` `>= 22.0.8`                   |
| `angular-resource` | Angular `httpResource`, peer `>= 22.0.8`                          |
| React packages     | peer `@tanstack/react-query >= 5` / `swr ^2.3.8`                  |
| decimal packages   | peer `decimal.js ^10.6.0`                                         |
| uuid packages      | peer `uuid ^14.0.1` (`value-to-uuid` has no runtime dependency)   |
| Module formats     | ESM + CJS (Angular: FESM2022), `sideEffects: false`, full `.d.ts` |

---

## 🗺️ Migrating from v9 and earlier

Older versions shipped a single Angular package. Since then the library was split into a framework-agnostic core plus adapters and strategies:

- `HttpParamsProcessorService.process(key, obj)` still works exactly as before ✅ — the default key formatting (`p.arr[0].id`) and ISO dates are unchanged.
- The service now lives in `@adaskothebeast/http-params-processor-angular` and needs `@adaskothebeast/http-params-processor-core` installed alongside it.
- Everything new is opt-in: key formatters, value converters, non-Angular adapters.

---

## 🤝 Contributing

Issues and PRs are welcome — see [CONTRIBUTING](./.github/CONTRIBUTING.md).
Bugs and feature requests: [github.com/AdaskoTheBeAsT/HttpParamsProcessor/issues](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor/issues).

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

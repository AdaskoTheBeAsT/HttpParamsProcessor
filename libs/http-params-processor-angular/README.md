# 🅰️ @adaskothebeast/http-params-processor-angular

**The Angular adapter of [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): an injectable service that turns deeply nested objects into `HttpParams` your backend can model bind.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-angular?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` and Angular itself. Published in Angular Package Format (ESM). `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-angular @adaskothebeast/http-params-processor-core
```

Peer dependencies: `@adaskothebeast/http-params-processor-core ^12.0.0`, `@angular/common >=22.0.8`, `@angular/core >=22.0.8`.

---

## 🎯 What it does

`HttpParamsProcessorService` walks an object graph and appends every leaf to an Angular `HttpParams` instance, so you can hand the result straight to `HttpClient`:

```ts
processor.process('p', { arr: [{ id: '1' }] }).toString();
// p.arr[0].id=1  (bracket characters percent-encoded by HttpParams)
```

Key formatting and value conversion are pluggable, either per call or application-wide through DI tokens.

---

## 🧰 API

### `HttpParamsProcessorService`

Declared `@Injectable({ providedIn: 'root' })`, so it is available without any module import.

| Member                                          | Returns      | Notes                                                              |
| ----------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `process(key, obj, options?)`                   | `HttpParams` | Starts from a fresh `new HttpParams()`                             |
| `processWithParams(params, key, obj, options?)` | `HttpParams` | Appends into params you already have; throws if `params` is `null` |

### DI tokens

| Token                          | Type                     | Effect                                                           |
| ------------------------------ | ------------------------ | ---------------------------------------------------------------- |
| `HTTP_PARAMS_KEY_FORMATTER`    | `IKeyFormattingStrategy` | Application-wide default key formatter                           |
| `HTTP_PARAMS_VALUE_CONVERTERS` | `IValueConverter[]`      | Application-wide default converter list (replaces the built-ins) |

Both are optional; the service falls back to `DefaultKeyFormattingStrategy` and to a `Date` plus primitive converter pair.

### Types and module

`HttpParamsProcessorOptions` (`{ keyFormatter?, valueConverters? }`), `IKeyFormattingStrategy` (the Angular flavour, whose optional `transformComplexObject` receives and returns `HttpParams`), and `HttpParamsProcessorModule` with a `forRoot()` helper for NgModule applications.

### Re-exports from `core`

Values: `DefaultKeyFormattingStrategy`, `ValueConverter`, `createValueConverter`, `DefaultDateValueFromStrategy`, `DefaultDateValueToStrategy`, `DefaultPrimitiveValueToStrategy`.
Types: `IKeyFormattingStrategyCore` (the framework-agnostic interface, renamed to avoid the clash), `IParamsAppender`, `IValueFromStrategy`, `IValueToStrategy`, `IValueConverter`, `DurationComponents`, `PeriodComponents`.

---

## ⚡ Usage

```ts
import { HttpParamsProcessorService } from '@adaskothebeast/http-params-processor-angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebApiService {
  private readonly http = inject(HttpClient);
  private readonly processor = inject(HttpParamsProcessorService);

  getByQuery(query: ComplexParams) {
    const params: HttpParams = this.processor.process('p', query);
    return this.http.get<ResultDto>('api/endpoint', { params });
  }
}
```

Already have params? Append into them:

```ts
let params = new HttpParams().set('page', '1');
params = this.processor.processWithParams(params, 'p', query);
// page=1&p.arr[0].id=1&...
```

Configure once for the whole application:

```ts
import { HTTP_PARAMS_KEY_FORMATTER, HTTP_PARAMS_VALUE_CONVERTERS, ValueConverter } from '@adaskothebeast/http-params-processor-angular';
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';
import { LuxonDateTimeValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { IsoDateValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-iso';

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: HTTP_PARAMS_KEY_FORMATTER,
      useValue: new BracketNotationKeyFormattingStrategy(),
    },
    {
      provide: HTTP_PARAMS_VALUE_CONVERTERS,
      useValue: [new ValueConverter(new LuxonDateTimeValueFromStrategy(), new IsoDateValueToStrategy())],
    },
  ],
});
```

NgModule applications can import `HttpParamsProcessorModule.forRoot()` instead, but it is optional because the service is `providedIn: 'root'`.

---

## 🎛️ Options and configuration

```ts
interface HttpParamsProcessorOptions {
  keyFormatter?: IKeyFormattingStrategy;
  valueConverters?: IValueConverter[];
}
```

Options passed to `process`/`processWithParams` override the DI defaults for that call only, and each field is resolved independently, so `{ keyFormatter }` keeps the configured converters.

Default converters, used when `HTTP_PARAMS_VALUE_CONVERTERS` is not provided:

| Value                         | Output          |
| ----------------------------- | --------------- |
| `Date`                        | `toISOString()` |
| `string \| number \| boolean` | `String(value)` |
| anything unmatched            | `String(value)` |

Providing `HTTP_PARAMS_VALUE_CONVERTERS` **replaces** the defaults, so register a `Date` converter yourself if you still pass native dates.

Key formatting packages (`-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`) work here: their optional `transformComplexObject` is generic over the appender, and `HttpParams` satisfies it.

---

## 📤 Output examples

`HttpParams.toString()` output for `process('p', ...)`:

```text
'text1 text2'                        p=text1%20text2
[1, 2]                               p%5B0%5D=1&p%5B1%5D=2
{ a: 1, b: 'text' }                  p.a=1&p.b=text
{ a: [1, 2] }                        p.a%5B0%5D=1&p.a%5B1%5D=2
{ a: { b: 1, c: 'text' } }           p.a.b=1&p.a.c=text
[{ a: 1, b: 'text' }, { a: 2 }]      p%5B0%5D.a=1&p%5B0%5D.b=text&p%5B1%5D.a=2
{ a: new Date(...) }                 p.a=2021-06-04T10:31:00.000Z
{ $type: 'classA', a: 1 }            p.a=1
{} / [] / null / undefined           (empty string)
```

---

## ⚠️ Edge cases

- `HttpParams` is **immutable**: every `append` returns a new instance, so always reassign (`params = processor.processWithParams(params, ...)`).
- `processWithParams` throws `Error: params is null or undefined - it should have instance of HttpParams` when you forget to pass an instance.
- `null` and `undefined` are skipped entirely, at the root and at any depth; no empty `key=` is emitted.
- A `$type` property (typical .NET/JSON.NET discriminator) is ignored.
- **Circular references throw** `Error: Circular reference detected at key: <key>`, for example `p.self`, `p.child.parent` or `p[2]`.
- Encoding is done by Angular's default `HttpUrlEncodingCodec`, not by this package. That codec leaves `:` unescaped, which is why ISO dates render as `2021-06-04T10:31:00.000Z`, while `[` and `]` become `%5B`/`%5D`.
- Values are always **appended**, never set, so repeated keys produced by a key formatter survive as multiple values.
- Non-plain objects (`Date`, `Decimal`, `Uint8Array`, class instances) are offered to the value converters before traversal, so they are never walked property by property.
- The service is stateless per call; the circular-reference tracker is created fresh each time, so sharing one object twice in a tree is fine as long as it is not an ancestor of itself.

---

## 🔗 Related packages

- Signals and `httpResource`: [`-angular-resource`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
- Other adapters: [`-fetch`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch), [`-axios`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios), [`-react-tanstack-query`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query), [`-react-swr`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr)
- Key formatting: `-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`
- Values: `-value-from-*` and `-value-to-*`

Full matrix and recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

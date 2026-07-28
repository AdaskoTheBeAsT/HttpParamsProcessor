# 🧩 @adaskothebeast/http-params-processor-core

**The framework-agnostic engine of [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): turns deeply nested objects into flat query parameter pairs.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-core?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Zero runtime dependencies. ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-core
```

`core` is a **peer dependency of every other package** in the family - adapters (`-angular`, `-fetch`, `-axios`, `-react-*`), key formatting strategies (`-key-*`) and value strategies (`-value-*`) all need it installed alongside them.

---

## 🎯 What it does

`ParamsProcessor` walks an object graph recursively and emits `[key, value]` string pairs:

```ts
import { ParamsProcessor } from '@adaskothebeast/http-params-processor-core';

const processor = new ParamsProcessor();

processor.process('p', {
  arr: [{ id: '1', innerArr: [{ id: '1.1', text: 'first' }] }],
});
```

```text
p.arr[0].id                = 1
p.arr[0].innerArr[0].id    = 1.1
p.arr[0].innerArr[0].text  = first
```

Two things are pluggable:

- **key formatting** - how nested keys are spelled (`user.name`, `user[name]`, `user_name`, …)
- **value conversion** - a two-stage `from → to` pipeline that normalizes a library type into a neutral shape and then renders it as a string

---

## 🧰 API

### `ParamsProcessor`

| Member                                  | Returns                              | Notes                                                           |
| --------------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| `new ParamsProcessor(options?)`         | -                                    | `options` sets the instance-wide defaults                       |
| `createParamsProcessor(options?)`       | `ParamsProcessor`                    | Factory helper, identical to the constructor                    |
| `process(key, obj, options?)`           | `ParamsEntry[]` (`[key, value][]`)   | The primitive every adapter builds on; preserves duplicate keys |
| `toQueryString(key, obj, options?)`     | `string`                             | `encodeURIComponent`-encoded, **no** leading `?`                |
| `toURLSearchParams(key, obj, options?)` | `URLSearchParams`                    | Uses `append`, so array entries survive                         |
| `toPlainObject(key, obj, options?)`     | `Record<string, string \| string[]>` | Duplicate keys collapse into arrays - handy for `axios.params`  |

`options` (`ParamsProcessorOptions`) can be passed per call and overrides the instance defaults:

```ts
interface ParamsProcessorOptions {
  keyFormatter?: IKeyFormattingStrategy;
  valueConverters?: IValueConverter[];
}
```

### Types

`ParamsEntry`, `Primitive`, `ProcessableInput`, `isPlainObjectOrArray`.

### Key formatting

| Export                         | Purpose                                                                  |
| ------------------------------ | ------------------------------------------------------------------------ |
| `IKeyFormattingStrategy`       | `formatObjectKey`, `formatArrayKey`, optional `transformComplexObject`   |
| `IParamsAppender`              | Minimal `append(key, value)` sink used by `transformComplexObject`       |
| `DefaultKeyFormattingStrategy` | Dot notation for objects (`user.name`), brackets for arrays (`items[0]`) |

### Value conversion pipeline

| Export                                                      | Purpose                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| `IValueFromStrategy<TFrom, TTo>`                            | `normalizeValue` + `canHandle` - library type → neutral shape |
| `IValueToStrategy<TFrom>`                                   | `serializeValue` + `canHandle` - neutral shape → `string`     |
| `IValueConverter`, `ValueConverter`, `createValueConverter` | Pairs one `from` with one `to`                                |
| `DefaultDateValueFromStrategy`                              | `Date` → `Date` (pass-through)                                |
| `DefaultDateValueToStrategy`                                | `Date` → `toISOString()`                                      |
| `DefaultPrimitiveValueToStrategy`                           | `string \| number \| boolean` → `String(value)`               |

### Intermediate models

| Export                                                    | Shape                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `DurationComponents`                                      | `{ years?, months?, weeks?, days?, hours?, minutes?, seconds?, milliseconds? }` |
| `PeriodComponents`                                        | `{ years?, months?, weeks?, days? }` (calendar-based, not convertible to ms)    |
| `DecimalComponents` + `isDecimalComponents`               | `{ decimal: string }` - lossless, non-exponential literal                       |
| `UuidComponents` + `isUuidComponents`, `UUID_BYTE_LENGTH` | `{ bytes: Uint8Array }` - 16 bytes, RFC 4122 order                              |

---

## 🎛️ Configuration

```ts
import { ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';
import { LuxonDateTimeValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { UnixTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-unix-timestamp';

const processor = new ParamsProcessor({
  keyFormatter: new BracketNotationKeyFormattingStrategy(),
  valueConverters: [createValueConverter(new LuxonDateTimeValueFromStrategy(), new UnixTimestampValueToStrategy())],
});
```

Converters are tried **in order**, first `canHandle` wins - put the specific ones first.

> ⚠️ Passing `valueConverters` **replaces** the defaults. If you still want plain `Date`s and primitives handled, append `createValueConverter(new DefaultDateValueFromStrategy(), new DefaultDateValueToStrategy())` and a primitive converter yourself - otherwise unmatched values fall back to `String(value)`.

### Writing your own strategy

```ts
import { IValueFromStrategy, IValueToStrategy } from '@adaskothebeast/http-params-processor-core';

class BigIntValueFromStrategy implements IValueFromStrategy<bigint, string> {
  normalizeValue(value: bigint): string {
    return value.toString();
  }
  canHandle(value: unknown): value is bigint {
    return typeof value === 'bigint';
  }
}
```

---

## 📤 Output examples

```ts
const processor = new ParamsProcessor();
const filter = { page: 2, tags: ['a', 'b'], from: new Date('2024-01-15T10:30:00Z') };

processor.toQueryString('p', filter);
// p.page=2&p.tags%5B0%5D=a&p.tags%5B1%5D=b&p.from=2024-01-15T10%3A30%3A00.000Z

processor.toPlainObject('p', filter);
// { 'p.page': '2', 'p.tags[0]': 'a', 'p.tags[1]': 'b', 'p.from': '2024-01-15T10:30:00.000Z' }

processor.process('', 'plain-value');
// [['', 'plain-value']]
```

---

## 📐 Behaviour you can rely on

- `null` and `undefined` properties are **skipped** entirely (no empty `key=`).
- A `$type` property (typical .NET/JSON.NET discriminator) is ignored.
- **Circular references throw** `Error: Circular reference detected at key: <key>` instead of hanging.
- Non-plain objects (`Date`, `Decimal`, `Uint8Array`, class instances…) are offered to the value converters **before** traversal, so they are never walked property by property.
- Plain objects and arrays are always traversed; only a `keyFormatter.transformComplexObject` that returns non-`null` (e.g. the JSON strategy) can short-circuit that.
- Array order is preserved, and `process` never merges duplicate keys - only `toPlainObject` groups them.
- Empty arrays and empty objects contribute no entries.
- Values are encoded once by `toQueryString`/`toURLSearchParams`; `process` returns **raw** strings, so encode them yourself when building URLs manually.

---

## 🔗 Related packages

Adapters: [`-angular`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular), [`-angular-resource`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource), [`-fetch`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch), [`-axios`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios), [`-react-tanstack-query`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query), [`-react-swr`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr).

Key formatting: `-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`.

Values in: `-value-from-dayjs`, `-value-from-luxon`, `-value-from-moment`, `-value-from-js-joda`, `-value-from-decimal`, `-value-from-uuid`.
Values out: `-value-to-iso`, `-value-to-nodatime`, `-value-to-unix-timestamp`, `-value-to-ms-timestamp`, `-value-to-date-fns`, `-value-to-decimal`, `-value-to-uuid`.

Full matrix, adapter recipes and migration notes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

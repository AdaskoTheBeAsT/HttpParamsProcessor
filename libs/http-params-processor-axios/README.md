# 🅰️ @adaskothebeast/http-params-processor-axios

**The axios adapter of [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): a `paramsSerializer` (or a pre-flattened params object) built from deeply nested objects.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-axios?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-axios)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Only `core` is a peer dependency. **axios itself is not a dependency and is never imported** - this package just produces strings and plain objects that axios understands. ESM only (`"type": "module"`). `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-axios @adaskothebeast/http-params-processor-core
```

Peer dependencies: `@adaskothebeast/http-params-processor-core ^12.0.0`. Bring your own axios at whatever version you already use.

---

## 🎯 What it does

axios does not flatten nested params for you, so `{ filter: { price: { min: 100 } } }` ends up serialized in whatever shape its default serializer picks. This package gives you two ways out:

- **`paramsSerializer`** - take over serialization completely and emit `filter.price.min=100`,
- **`toParams`** - pre-flatten into `{ 'filter.price.min': '100' }` and let axios send it as-is.

---

## 🧰 API

### `AxiosParamsProcessor`

| Member                                | Returns                              | Notes                                                      |
| ------------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| `new AxiosParamsProcessor(config?)`   | -                                    | `config` sets instance-wide defaults                       |
| `createAxiosParamsProcessor(config?)` | `AxiosParamsProcessor`               | Factory helper, identical to the constructor               |
| `serialize(key, obj, options?)`       | `string`                             | `key=value` pairs joined with `&`, encoded unless disabled |
| `createSerializer(key, options?)`     | `(params) => string`                 | Ready to drop into `paramsSerializer`                      |
| `toParams(key, obj, options?)`        | `Record<string, string \| string[]>` | Delegates to `ParamsProcessor.toPlainObject`               |
| `coreProcessor`                       | `ParamsProcessor`                    | Getter for the underlying core instance                    |

### Standalone helper

`createParamsSerializer(key, config?)` builds a throwaway processor and returns its serializer in one call.

### Types

`AxiosParamsProcessorConfig` (`{ keyFormatter?, valueConverters? }`) and `AxiosParamsProcessorOptions`, which extends the core `ParamsProcessorOptions` with `encode?: boolean`.

### Re-exports from `core`

Values: `ValueConverter`, `createValueConverter`, `DefaultKeyFormattingStrategy`, `DefaultDateValueFromStrategy`, `DefaultDateValueToStrategy`, `DefaultPrimitiveValueToStrategy`.
Types: `ParamsProcessorOptions`, `ProcessableInput`, `ParamsEntry`, `IKeyFormattingStrategy`, `IValueConverter`, `IValueFromStrategy`, `IValueToStrategy`, `DurationComponents`, `PeriodComponents`.

---

## ⚡ Usage

```ts
import { createAxiosParamsProcessor } from '@adaskothebeast/http-params-processor-axios';
import axios from 'axios';

const processor = createAxiosParamsProcessor();

// 1. take over serialization
await axios.get('/api/products', {
  params: { category: 'electronics', price: { min: 100, max: 500 } },
  paramsSerializer: processor.createSerializer('filter'),
});
// GET /api/products?filter.category=electronics&filter.price.min=100&filter.price.max=500

// 2. or pre-flatten and let axios send the object
await axios.get('/api/products', {
  params: processor.toParams('filter', { user: { name: 'John' } }),
  // { 'filter.user.name': 'John' }
});
```

Global default for every request:

```ts
axios.defaults.paramsSerializer = processor.createSerializer('filter');
```

One-off, without keeping an instance around:

```ts
import { createParamsSerializer } from '@adaskothebeast/http-params-processor-axios';

await axios.get('/api', {
  params: myObject,
  paramsSerializer: createParamsSerializer('filter'),
});
```

---

## 🎛️ Options and configuration

```ts
const processor = new AxiosParamsProcessor({
  keyFormatter: new BracketNotationKeyFormattingStrategy(),
  valueConverters: [createValueConverter(new LuxonDateTimeValueFromStrategy(), new IsoDateValueToStrategy())],
});
```

| Option            | Where                                         | Effect                                                         |
| ----------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `keyFormatter`    | constructor config, or per call in `options`  | How nested keys are spelled                                    |
| `valueConverters` | constructor config, or per call in `options`  | `from -> to` pipeline; first `canHandle` wins                  |
| `encode`          | `serialize` / `createSerializer` options only | `true` (default) applies `encodeURIComponent` to key and value |

`toParams` takes the core `ParamsProcessorOptions` only; `encode` has no meaning there because axios does the encoding.

---

## 📤 Output examples

```ts
const processor = new AxiosParamsProcessor();

processor.serialize('filter', { status: 'active', count: 10 });
// filter.status=active&filter.count=10

processor.serialize('filter', { user: { name: 'John', age: 30 } });
// filter.user.name=John&filter.user.age=30

processor.serialize('items', ['a', 'b', 'c']);
// items%5B0%5D=a&items%5B1%5D=b&items%5B2%5D=c

processor.serialize('filter', { query: 'hello world' });
// filter.query=hello%20world

processor.serialize('filter', { query: 'hello world' }, { encode: false });
// filter.query=hello world

processor.serialize('filter', { createdAt: new Date('2024-01-01T00:00:00.000Z') });
// filter.createdAt=2024-01-01T00%3A00%3A00.000Z

processor.serialize('filter', { active: true, deleted: false });
// filter.active=true&filter.deleted=false

processor.serialize('filter', { a: 'value', b: null, c: undefined, d: 'another' });
// filter.a=value&filter.d=another

processor.toParams('filter', { status: 'active', user: { name: 'John' } });
// { 'filter.status': 'active', 'filter.user.name': 'John' }

processor.toParams('items', ['a', 'b']);
// { 'items[0]': 'a', 'items[1]': 'b' }
```

---

## ⚠️ Edge cases

- **An empty root key still produces a leading dot.** `serialize('', { status: 'active' })` returns `.status=active`, because the default formatter joins parent and property with `.`. Pass a real prefix (`'filter'`), or use a key formatter that handles an empty parent, if your backend cannot accept it.
- `encode: false` emits raw characters (`filter.query=hello world`). axios does **not** re-encode the string a `paramsSerializer` returns, so only disable encoding when you encode later yourself.
- With the default formatter every key is unique, so `toParams` values are plain strings. Array values appear only when a key formatter deliberately repeats a key (Rails style `items[]`), and then axios' own serializer decides how to render them.
- `null` and `undefined` are skipped at every depth, so no `key=` pairs are produced for them.
- A `$type` property is ignored, and circular references throw `Error: Circular reference detected at key: <key>`.
- Everything that is not matched by a converter falls back to `String(value)`.
- `serialize` never adds a leading `?`; axios joins the query string to the URL itself.
- Providing `valueConverters` replaces the core defaults, so include `Date` and primitive converters if you still need them.

---

## 🔗 Related packages

- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)
- Other adapters: [`-fetch`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-fetch), [`-angular`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular), [`-angular-resource`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-angular-resource), [`-react-tanstack-query`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-tanstack-query), [`-react-swr`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-react-swr)
- Key formatting: `-key-bracket-notation`, `-key-rails`, `-key-flat`, `-key-custom-delimiter`, `-key-json`
- Values: `-value-from-*` and `-value-to-*`

Full matrix and recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

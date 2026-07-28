# 🔲 @adaskothebeast/http-params-processor-key-bracket-notation

**PHP style bracket notation key formatting for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): every level of nesting becomes `user[profile][email]`, `items[0]`.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-key-bracket-notation?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-bracket-notation)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` (its only peer dependency, `^12.0.0`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-key-bracket-notation @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

This is a **key formatting strategy**: it decides how nested keys are spelled while `ParamsProcessor` walks your object graph. It replaces the core default (dot notation for object properties) with brackets at every level, which is the shape PHP's `parse_str`, Laravel, Symfony, Rack and the Node `qs` library parse back into nested structures.

| Input                        | `DefaultKeyFormattingStrategy` (core) | `BracketNotationKeyFormattingStrategy` |
| ---------------------------- | ------------------------------------- | -------------------------------------- |
| `{ user: { name: 'John' } }` | `p.user.name`                         | `p[user][name]`                        |
| `{ items: ['a', 'b'] }`      | `p.items[0]`, `p.items[1]`            | `p[items][0]`, `p[items][1]`           |
| `{ arr: [{ id: '1' }] }`     | `p.arr[0].id`                         | `p[arr][0][id]`                        |

Array keys are identical to the core default (`items[0]`); only object property keys change.

---

## 🧰 API

### `BracketNotationKeyFormattingStrategy`

Implements `IKeyFormattingStrategy` from `core`.

| Member                                       | Returns  | Result                               |
| -------------------------------------------- | -------- | ------------------------------------ |
| `new BracketNotationKeyFormattingStrategy()` | -        | No constructor options               |
| `formatObjectKey(parentKey, propertyKey)`    | `string` | `` `${parentKey}[${propertyKey}]` `` |
| `formatArrayKey(parentKey, index)`           | `string` | `` `${parentKey}[${index}]` ``       |

`transformComplexObject` is not implemented, so traversal is never short-circuited: nested objects and arrays are always walked down to primitives.

---

## ⚡ Usage

```ts
import { ParamsProcessor } from '@adaskothebeast/http-params-processor-core';
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';

const processor = new ParamsProcessor({
  keyFormatter: new BracketNotationKeyFormattingStrategy(),
});

processor.process('p', {
  user: { name: 'John', profile: { email: 'john@example.com' } },
  items: ['a', 'b'],
});
// [
//   ['p[user][name]', 'John'],
//   ['p[user][profile][email]', 'john@example.com'],
//   ['p[items][0]', 'a'],
//   ['p[items][1]', 'b'],
// ]
```

The very same `keyFormatter` option is accepted by every adapter (`-angular`, `-angular-resource`, `-fetch`, `-axios`, `-react-tanstack-query`, `-react-swr`), because they all forward their options object to `ParamsProcessor`.

---

## 🎛️ Options and configuration

There are no constructor options - bracket notation has exactly one shape. What you can choose is **scope**:

```ts
const strategy = new BracketNotationKeyFormattingStrategy();

// instance-wide default
const processor = new ParamsProcessor({ keyFormatter: strategy });

// or per call, overriding the instance default
processor.toQueryString('p', filter, { keyFormatter: strategy });
```

The strategy is stateless, so a single instance can be shared across processors and calls.

If you need `items[]` instead of `items[0]` (idiomatic Rails/Rack), use [`-key-rails`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails); it formats objects exactly the same way and only differs in array keys.

---

## 📤 Output examples

```ts
const processor = new ParamsProcessor({
  keyFormatter: new BracketNotationKeyFormattingStrategy(),
});

processor.process('p', { arr: [{ id: '1', innerArr: [{ id: '1.1' }] }] });
```

```text
p[arr][0][id]                 = 1
p[arr][0][innerArr][0][id]    = 1.1
```

```ts
processor.toQueryString('p', { user: { name: 'John' } });
// p%5Buser%5D%5Bname%5D=John

processor.toPlainObject('p', { items: ['a', 'b'] });
// { 'p[items][0]': 'a', 'p[items][1]': 'b' }
```

Server side, `p[user][name]=John` binds to `$_GET['p']['user']['name']` in PHP, to `params[:p][:user][:name]` in Rack/Rails and to `{ p: { user: { name: 'John' } } }` with `qs.parse` (Express `extended` query parser).

---

## ⚠️ Edge cases

- Brackets are **percent encoded** by `toQueryString` and `toURLSearchParams` (`p%5Buser%5D`). That is what every mainstream backend expects; `process` returns raw, unencoded keys.
- Numeric object property keys stay object keys: `formatObjectKey('data', '0')` gives `data[0]`, which is indistinguishable from an array element - a backend may bind such an object as a list.
- An **empty root key** produces keys that start with a bracket (`process('', { user: 1 })` gives `[user]`). Pass a real root name.
- Property names containing `[`, `]` or `.` are inserted verbatim into the key, so they can break the backend's own bracket parser after encoding. Rename such properties before serializing.
- Very deep graphs produce long keys; some servers and proxies cap query string length (often 2 - 8 KB).
- `null` and `undefined` values, `$type` discriminators, empty objects and empty arrays are handled by `core`, not by this strategy: they simply never reach `formatObjectKey`/`formatArrayKey`.
- Circular references still throw `Error: Circular reference detected at key: <key>` from `core`.

---

## 🔗 Related packages

- Same object shape, different arrays: [`-key-rails`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails) (`items[]`)
- Other key strategies: [`-key-flat`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-flat) (`user_name`), [`-key-custom-delimiter`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-custom-delimiter) (`user:name`), [`-key-json`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-json) (whole subtree as one JSON value)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core) (ships `DefaultKeyFormattingStrategy`, the dot notation default)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

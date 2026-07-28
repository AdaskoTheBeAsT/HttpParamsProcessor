# 🛤️ @adaskothebeast/http-params-processor-key-rails

**Ruby on Rails and Rack style key formatting for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): `user[name]` for objects, `items[]` for array elements.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-key-rails?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` (its only peer dependency, `^12.0.0`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-key-rails @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

This is a **key formatting strategy**: it decides how nested keys are spelled while `ParamsProcessor` walks your object graph. It emits exactly what `Rack::Utils.parse_nested_query` (and therefore Rails `params`) expects: brackets around object properties and **empty brackets** for array elements.

| Input                                 | `DefaultKeyFormattingStrategy` (core) | `RailsKeyFormattingStrategy` (default) |
| ------------------------------------- | ------------------------------------- | -------------------------------------- |
| `{ user: { name: 'John' } }`          | `p.user.name`                         | `p[user][name]`                        |
| `{ items: ['x', 'y'] }`               | `p.items[0]`, `p.items[1]`            | `p[items][]` twice                     |
| `{ arr: [{ id: '1' }, { id: '2' }] }` | `p.arr[0].id`, `p.arr[1].id`          | `p[arr][][id]` twice                   |

Rack rebuilds arrays of hashes positionally: it starts a new hash whenever a key repeats, so `arr[][id]=1&arr[][id]=2` parses back to `[{ id: 1 }, { id: 2 }]`.

---

## 🧰 API

### `RailsKeyFormattingStrategy`

Implements `IKeyFormattingStrategy` from `core`.

| Member                                         | Returns  | Result                                                   |
| ---------------------------------------------- | -------- | -------------------------------------------------------- |
| `new RailsKeyFormattingStrategy(arrayFormat?)` | -        | `arrayFormat` defaults to `'brackets'`                   |
| `formatObjectKey(parentKey, propertyKey)`      | `string` | `` `${parentKey}[${propertyKey}]` `` in both formats     |
| `formatArrayKey(parentKey, index)`             | `string` | `` `${parentKey}[]` `` or `` `${parentKey}[${index}]` `` |

### `RailsArrayFormat`

```ts
type RailsArrayFormat = 'brackets' | 'indexed';
```

| Value                  | Array key  | Use when                                                                 |
| ---------------------- | ---------- | ------------------------------------------------------------------------ |
| `'brackets'` (default) | `items[]`  | Idiomatic Rails/Rack: order carries the position                         |
| `'indexed'`            | `items[0]` | Explicit indices, also accepted by Rack, needed for arrays inside arrays |

`transformComplexObject` is not implemented, so nested objects and arrays are always traversed down to primitives.

---

## ⚡ Usage

```ts
import { createParamsProcessor } from '@adaskothebeast/http-params-processor-core';
import { RailsKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-rails';

const processor = createParamsProcessor({
  keyFormatter: new RailsKeyFormattingStrategy(),
});

processor.process('p', { items: ['x', 'y'] });
// [['p[items][]', 'x'], ['p[items][]', 'y']]

processor.process('p', {
  arr: [
    { id: '1', text: 'first' },
    { id: '2', text: 'second' },
  ],
});
// [
//   ['p[arr][][id]', '1'],
//   ['p[arr][][text]', 'first'],
//   ['p[arr][][id]', '2'],
//   ['p[arr][][text]', 'second'],
// ]
```

`process` preserves duplicate keys and their order, which is precisely what the empty bracket format relies on. The same `keyFormatter` option is accepted by every adapter (`-angular`, `-angular-resource`, `-fetch`, `-axios`, `-react-tanstack-query`, `-react-swr`).

---

## 🎛️ Options and configuration

```ts
new RailsKeyFormattingStrategy(); // 'brackets' - items[]
new RailsKeyFormattingStrategy('brackets'); // same, explicit
new RailsKeyFormattingStrategy('indexed'); // items[0]
```

Object keys are bracketed in both modes; only array element keys differ.

```ts
const processor = createParamsProcessor({
  keyFormatter: new RailsKeyFormattingStrategy('indexed'),
});

processor.process('p', { arr: [{ id: '1' }, { id: '2' }] });
// [['p[arr][0][id]', '1'], ['p[arr][1][id]', '2']]
```

The strategy is stateless, so instances can be shared, and `keyFormatter` can also be passed per call to override the processor default.

---

## 📤 Output examples

```text
'brackets' (default)
p[items][]        = x
p[items][]        = y
p[arr][][id]      = 1
p[arr][][text]    = first
p[arr][][id]      = 2
p[arr][][text]    = second

'indexed'
p[arr][0][id]     = 1
p[arr][1][id]     = 2
p[user][tags][2]  = ruby
```

```ts
processor.toQueryString('p', { items: ['x', 'y'] });
// p%5Bitems%5D%5B%5D=x&p%5Bitems%5D%5B%5D=y

processor.toPlainObject('p', { items: ['x', 'y'] });
// { 'p[items][]': ['x', 'y'] }   duplicate keys collapse into an array
```

On the server, `p[items][]=x&p[items][]=y` becomes `params[:p][:items] == ['x', 'y']` in Rails, and Node's `qs` parses it into `{ p: { items: ['x', 'y'] } }`.

---

## ⚠️ Edge cases

- In `'brackets'` mode the **index is ignored**: `formatArrayKey('items', 7)` is still `items[]`. Position comes from the order of the emitted pairs, so never sort or deduplicate the entries before sending them.
- Rack's positional grouping cannot disambiguate an **array nested directly inside an array element** (`arr[][inner][]`); switch to `new RailsKeyFormattingStrategy('indexed')` for such payloads.
- Grouping also breaks if two sibling elements do not carry the same properties (a `null`/`undefined` property is skipped by `core`, so that element emits fewer pairs and Rack may merge it with the next one). Use `'indexed'` for sparse objects.
- `toPlainObject` merges the repeated `items[]` key into a string array, which is what `axios` `params` needs; `process` keeps the duplicates separate.
- An **empty root key** yields keys starting with a bracket (`[user]`), so pass a real root name.
- Numeric object property keys stay object keys: `formatObjectKey('data', '0')` gives `data[0]`.
- `null`/`undefined` values, `$type` discriminators, empty objects and empty arrays are dropped by `core` before this strategy is consulted; circular references throw `Error: Circular reference detected at key: <key>`.

---

## 🔗 Related packages

- Same object shape, indexed arrays only: [`-key-bracket-notation`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-bracket-notation) (PHP, Laravel, Symfony)
- Other key strategies: [`-key-flat`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-flat) (`user_name`), [`-key-custom-delimiter`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-custom-delimiter) (`user:name`), [`-key-json`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-json) (whole subtree as one JSON value)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

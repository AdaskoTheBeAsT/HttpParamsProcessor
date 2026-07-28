# ➖ @adaskothebeast/http-params-processor-key-flat

**Flat, separator joined key formatting for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): `user_profile_email`, `items_0`, no brackets or dots anywhere.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-key-flat?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-flat)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` (its only peer dependency, `^12.0.0`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-key-flat @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

This is a **key formatting strategy**: it decides how nested keys are spelled while `ParamsProcessor` walks your object graph. It joins every level (object properties _and_ array indices) with a single separator, so the resulting query string contains only plain identifier-like names. That is what legacy APIs, CGI style endpoints, form field naming conventions and validators that reject `[`, `]` or `.` in parameter names need.

| Input                        | `DefaultKeyFormattingStrategy` (core) | `FlatKeyFormattingStrategy` (default) |
| ---------------------------- | ------------------------------------- | ------------------------------------- |
| `{ user: { name: 'John' } }` | `p.user.name`                         | `p_user_name`                         |
| `{ items: ['a', 'b'] }`      | `p.items[0]`, `p.items[1]`            | `p_items_0`, `p_items_1`              |
| `{ arr: [{ id: '1' }] }`     | `p.arr[0].id`                         | `p_arr_0_id`                          |

Keys need no percent encoding with the default `_` separator, which keeps URLs readable in logs.

---

## 🧰 API

### `FlatKeyFormattingStrategy`

Implements `IKeyFormattingStrategy` from `core`.

| Member                                      | Returns  | Result                                         |
| ------------------------------------------- | -------- | ---------------------------------------------- |
| `new FlatKeyFormattingStrategy(separator?)` | -        | `separator` defaults to `'_'`                  |
| `formatObjectKey(parentKey, propertyKey)`   | `string` | `` `${parentKey}${separator}${propertyKey}` `` |
| `formatArrayKey(parentKey, index)`          | `string` | `` `${parentKey}${separator}${index}` ``       |

`separator` is any string, not a restricted union: `'-'`, `'__'`, `'.'`, `'::'` all work. `transformComplexObject` is not implemented, so nested objects and arrays are always traversed down to primitives.

---

## ⚡ Usage

```ts
import { ParamsProcessor } from '@adaskothebeast/http-params-processor-core';
import { FlatKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-flat';

const processor = new ParamsProcessor({
  keyFormatter: new FlatKeyFormattingStrategy(),
});

processor.process('p', {
  user: { name: 'John', profile: { email: 'john@example.com' } },
  items: ['a', 'b'],
});
// [
//   ['p_user_name', 'John'],
//   ['p_user_profile_email', 'john@example.com'],
//   ['p_items_0', 'a'],
//   ['p_items_1', 'b'],
// ]
```

The same `keyFormatter` option is accepted by every adapter (`-angular`, `-angular-resource`, `-fetch`, `-axios`, `-react-tanstack-query`, `-react-swr`), because they all forward their options object to `ParamsProcessor`.

---

## 🎛️ Options and configuration

```ts
new FlatKeyFormattingStrategy(); // '_'  -> user_name, items_0
new FlatKeyFormattingStrategy('-'); // '-'  -> user-name, items-0
new FlatKeyFormattingStrategy('__'); // '__' -> user__name, items__0
```

| Separator | `user` + `name` | `items` + `0` | Notes                                             |
| --------- | --------------- | ------------- | ------------------------------------------------- |
| `'_'`     | `user_name`     | `items_0`     | Default, URL safe, no encoding                    |
| `'-'`     | `user-name`     | `items-0`     | URL safe, common for kebab-case backends          |
| `'__'`    | `user__name`    | `items__0`    | Reduces collisions with `_` inside property names |
| `'.'`     | `user.name`     | `items.0`     | Dots everywhere, including array indices          |

The same separator is used for objects and arrays by design; there is no separate array format. If you want dots (or another delimiter) for objects but keep `items[0]` for arrays, use [`-key-custom-delimiter`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-custom-delimiter).

The strategy is stateless, so a single instance can be shared, and `keyFormatter` can also be passed per call to override the processor default.

---

## 📤 Output examples

```ts
const processor = new ParamsProcessor({
  keyFormatter: new FlatKeyFormattingStrategy(),
});

processor.process('p', { arr: [{ id: '1', innerArr: [{ id: '1.1' }] }] });
```

```text
p_arr_0_id                = 1
p_arr_0_innerArr_0_id     = 1.1
```

```ts
processor.toQueryString('p', { user: { name: 'John' }, items: ['a'] });
// p_user_name=John&p_items_0=a

processor.toPlainObject('p', { user: { tags: ['a', 'b'] } });
// { 'p_user_tags_0': 'a', 'p_user_tags_1': 'b' }
```

Backends that expect `user_name` / `items_0` style parameters (hand written PHP/Perl/CGI handlers, ASP.NET Web Forms style names, form encoded gateways, analytics collectors) bind these directly without a nested query parser.

---

## ⚠️ Edge cases

- **Flattening is lossy.** `{ user_name: 'x' }` and `{ user: { name: 'x' } }` both produce `p_user_name`, and if two branches collide the later pair simply repeats the key. Pick a separator that cannot appear in your property names (`'__'` is a good compromise) or rename the properties.
- Array indices are joined the same way as properties, so `p_items_0` is indistinguishable from an object property literally named `0`. Most backends cannot rebuild arrays from this shape - they read `p_items_0`, `p_items_1` as separate fields.
- An **empty root key** produces a leading separator (`process('', { user: 1 })` gives `_user`). Pass a real root name.
- Separators are not escaped or validated: a separator such as `'&'` or `'='` would produce broken looking keys once encoded (`toQueryString` percent encodes them, so the query string stays parseable but the key is ugly).
- Deeply nested graphs create long names; watch server limits on parameter name length and on total query string size.
- `null`/`undefined` values, `$type` discriminators, empty objects and empty arrays are dropped by `core` before this strategy is consulted; circular references throw `Error: Circular reference detected at key: <key>`.

---

## 🔗 Related packages

- Nested-capable alternatives: [`-key-bracket-notation`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-bracket-notation) (`user[name]`), [`-key-rails`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails) (`items[]`)
- Mixed shape: [`-key-custom-delimiter`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-custom-delimiter) (custom object delimiter, brackets or delimiter for arrays)
- Single parameter: [`-key-json`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-json)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

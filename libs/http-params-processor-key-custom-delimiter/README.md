# ✂️ @adaskothebeast/http-params-processor-key-custom-delimiter

**Bring your own delimiter to [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): `user:name`, `user->name`, `api/users`, with brackets or the same delimiter for arrays.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-key-custom-delimiter?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-custom-delimiter)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` (its only peer dependency, `^12.0.0`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-key-custom-delimiter @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

This is a **key formatting strategy**: it decides how nested keys are spelled while `ParamsProcessor` walks your object graph. Object properties are joined with a delimiter **you** choose (default `':'`), while array elements keep bracket indices unless you ask for the delimiter there too. It exists for bespoke or legacy APIs whose notation does not match dots, brackets, Rails or flat underscores.

| Input                        | `DefaultKeyFormattingStrategy` (core) | This strategy (defaults)   |
| ---------------------------- | ------------------------------------- | -------------------------- |
| `{ user: { name: 'John' } }` | `p.user.name`                         | `p:user:name`              |
| `{ items: ['a', 'b'] }`      | `p.items[0]`, `p.items[1]`            | `p:items[0]`, `p:items[1]` |
| `{ arr: [{ id: '1' }] }`     | `p.arr[0].id`                         | `p:arr[0]:id`              |

---

## 🧰 API

### `CustomDelimiterKeyFormattingStrategy`

Implements `IKeyFormattingStrategy` from `core`.

| Member                                                                     | Returns  | Result                                                                           |
| -------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `new CustomDelimiterKeyFormattingStrategy(objectDelimiter?, arrayFormat?)` | -        | Defaults: `':'` and `'bracket'`                                                  |
| `formatObjectKey(parentKey, propertyKey)`                                  | `string` | `` `${parentKey}${objectDelimiter}${propertyKey}` ``                             |
| `formatArrayKey(parentKey, index)`                                         | `string` | `` `${parentKey}[${index}]` `` or `` `${parentKey}${objectDelimiter}${index}` `` |

Constructor parameters:

| Parameter         | Type                       | Default     | Meaning                                                     |
| ----------------- | -------------------------- | ----------- | ----------------------------------------------------------- |
| `objectDelimiter` | `string`                   | `':'`       | Inserted between a parent key and a property name           |
| `arrayFormat`     | `'bracket' \| 'delimiter'` | `'bracket'` | `'bracket'` keeps `items[0]`, `'delimiter'` emits `items:0` |

`transformComplexObject` is not implemented, so nested objects and arrays are always traversed down to primitives.

---

## ⚡ Usage

```ts
import { ParamsProcessor } from '@adaskothebeast/http-params-processor-core';
import { CustomDelimiterKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-custom-delimiter';

const processor = new ParamsProcessor({
  keyFormatter: new CustomDelimiterKeyFormattingStrategy(),
});

processor.process('p', {
  user: { name: 'John', profile: { email: 'john@example.com' } },
  items: ['a', 'b'],
});
// [
//   ['p:user:name', 'John'],
//   ['p:user:profile:email', 'john@example.com'],
//   ['p:items[0]', 'a'],
//   ['p:items[1]', 'b'],
// ]
```

The same `keyFormatter` option is accepted by every adapter (`-angular`, `-angular-resource`, `-fetch`, `-axios`, `-react-tanstack-query`, `-react-swr`), because they all forward their options object to `ParamsProcessor`.

---

## 🎛️ Options and configuration

```ts
new CustomDelimiterKeyFormattingStrategy(); // ':' + brackets
new CustomDelimiterKeyFormattingStrategy('->'); // user->name, items[0]
new CustomDelimiterKeyFormattingStrategy('/'); // api/users, api/users[0]
new CustomDelimiterKeyFormattingStrategy(':', 'delimiter'); // user:name, items:2
```

| Constructor arguments | `user` + `name` | `items` + `2`  |
| --------------------- | --------------- | -------------- |
| _(none)_              | `user:name`     | `items[2]`     |
| `'->'`                | `user->name`    | `items[2]`     |
| `'/'`                 | `api/users`     | `api/users[2]` |
| `':', 'delimiter'`    | `user:name`     | `items:2`      |
| `'.', 'delimiter'`    | `user.name`     | `items.2`      |

`'delimiter'` mode reuses `objectDelimiter` for indices, so array elements and object properties become indistinguishable in the key - pick it only when your backend does not need to tell them apart (or when it splits on the delimiter and infers arrays from numeric segments).

The strategy is stateless, so a single instance can be shared, and `keyFormatter` can also be passed per call to override the processor default.

---

## 📤 Output examples

```ts
const processor = new ParamsProcessor({
  keyFormatter: new CustomDelimiterKeyFormattingStrategy(':', 'delimiter'),
});

processor.process('p', { arr: [{ id: '1', innerArr: [{ id: '1.1' }] }] });
```

```text
p:arr:0:id                = 1
p:arr:0:innerArr:0:id     = 1.1
```

```ts
const arrow = new ParamsProcessor({
  keyFormatter: new CustomDelimiterKeyFormattingStrategy('->'),
});

arrow.process('p', { user: { name: 'John' }, items: ['a'] });
// [['p->user->name', 'John'], ['p->items[0]', 'a']]

arrow.toQueryString('p', { user: { name: 'John' } });
// p-%3Euser-%3Ename=John
```

---

## ⚠️ Edge cases

- **Delimiters are percent encoded** by `toQueryString` and `toURLSearchParams`: `':'` becomes `%3A`, `'/'` becomes `%2F`, `'->'` becomes `-%3E`. `process` returns raw keys, so if the backend must literally see `:` or `/`, build the URL yourself from `process` output (both characters are legal unencoded in a query component).
- The delimiter is inserted verbatim, with no escaping. If a property name contains the delimiter, the key becomes ambiguous - the same collision risk as [`-key-flat`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-flat).
- An **empty root key** produces a leading delimiter (`process('', { user: 1 })` gives `:user`). Pass a real root name.
- In `'bracket'` mode array keys are always `[index]`, independent of `objectDelimiter`; there is no way to get empty brackets (`items[]`) - use [`-key-rails`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails) for that.
- `arrayFormat` accepts only `'bracket'` and `'delimiter'`; any other value is rejected by TypeScript, and at runtime anything other than `'bracket'` behaves as `'delimiter'`.
- Numeric object property keys are formatted like properties, not indices: with defaults, `formatObjectKey('data', '0')` gives `data:0` while `formatArrayKey('data', 0)` gives `data[0]`.
- `null`/`undefined` values, `$type` discriminators, empty objects and empty arrays are dropped by `core` before this strategy is consulted; circular references throw `Error: Circular reference detected at key: <key>`.

---

## 🔗 Related packages

- Fixed notations: [`-key-bracket-notation`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-bracket-notation) (`user[name]`), [`-key-rails`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-rails) (`items[]`), [`-key-flat`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-flat) (`user_name`, one separator everywhere)
- Single parameter: [`-key-json`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-key-json)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core) (implement `IKeyFormattingStrategy` yourself if even this is not flexible enough)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

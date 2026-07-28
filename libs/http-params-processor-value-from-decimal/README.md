# 🔢 @adaskothebeast/http-params-processor-value-from-decimal

**`decimal.js` input strategy for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): turns `Decimal` instances into a lossless, never exponential decimal literal.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-from-decimal?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-decimal)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `core` + `decimal.js` (types ship with `decimal.js`, no companion `@types` package). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-from-decimal @adaskothebeast/http-params-processor-core decimal.js
```

---

## 🎯 What it does

This is a **value-from** strategy: the first half of the conversion pipeline. It normalizes a `decimal.js` value into the neutral `DecimalComponents` shape from `core` (`{ decimal: string }`), and a **value-to** strategy from [`-value-to-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-decimal) decides the wire format.

| Class                      | Normalizes | Produces                            |
| -------------------------- | ---------- | ----------------------------------- |
| `DecimalValueFromStrategy` | `Decimal`  | `DecimalComponents` (`{ decimal }`) |

Why not just let the processor call `String(value)`?

```ts
String(new Decimal('1e-7')); // '1e-7'      - exponential, rejected by many binders
String(new Decimal('1e21')); // '1e+21'     - exponential again
Number('12345678901234567890.1234567890123456789'); // 12345678901234567000 - digits lost
```

`DecimalValueFromStrategy` calls `toFixed()` with no argument, which is the one `decimal.js` formatter that is both **lossless** (every significant digit is kept) and **never exponential**, whatever the ambient `toExpNeg` / `toExpPos` settings are.

---

## ⚡ Usage

```ts
import { ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { DecimalValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-decimal';
import { DecimalStringValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-decimal';
import Decimal from 'decimal.js';

const processor = new ParamsProcessor({
  valueConverters: [createValueConverter(new DecimalValueFromStrategy(), new DecimalStringValueToStrategy())],
});

processor.process('p', {
  price: new Decimal('12.50'),
  rate: new Decimal('1e-7'),
});
// [['p.price', '12.5'], ['p.rate', '0.0000001']]
```

---

## 🎛️ Options and configuration

`DecimalValueFromStrategy` has **no constructor options** - the intermediate literal is intentionally fixed, and formatting decisions (fixed decimal places, exponential notation, number literals) belong to the paired value-to strategy.

`canHandle` accepts a value when both conditions hold:

- `Decimal.isDecimal(value)` is `true`, which also covers instances created from a `Decimal.clone({ precision: 40 })` constructor
- `value.isFinite()` is `true`

Everything else is left to the next converter, including:

| Input                                       | `canHandle` | Reason                                                           |
| ------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `new Decimal('123.45')`, `new Decimal(0)`   | `true`      | finite `Decimal` instance                                        |
| `new Cloned('123.45')`                      | `true`      | clones are still `Decimal`s                                      |
| `new Decimal(NaN)`, `new Decimal(Infinity)` | `false`     | not finite                                                       |
| `'123.45'`                                  | `false`     | decimal shaped **strings** are ambiguous (`phone`, `postalCode`) |
| `123.45`                                    | `false`     | plain numbers are handled by the primitive converter             |
| `null`, `{ decimal: '1' }`                  | `false`     | not a `Decimal`                                                  |

---

## 📤 Output examples

`normalizeValue` results, straight from the test suite:

| `Decimal` input                              | `DecimalComponents.decimal`                  |
| -------------------------------------------- | -------------------------------------------- |
| `'12345678901234567890.1234567890123456789'` | `'12345678901234567890.1234567890123456789'` |
| `'+42'`                                      | `'42'`                                       |
| `'.5'`                                       | `'0.5'`                                      |
| `'1.25e+8'`                                  | `'125000000'`                                |
| `'1e-7'`                                     | `'0.0000001'`                                |
| `'-0.001'`                                   | `'-0.001'`                                   |

---

## ⚠️ Edge cases

- **Strings and numbers are never claimed.** If your API sends decimals as strings, convert them to `Decimal` first, otherwise they flow through the default primitive handling untouched.
- **`NaN` and `Infinity` are not claimed**, so they end up in the fallback `String(value)` path (`'NaN'`, `'Infinity'`) rather than producing an unparsable decimal literal. Filter them out before serializing if your backend rejects them.
- **Input notation is normalized**: a leading `+` is dropped, a bare `.5` gains its integer zero, and exponential inputs are expanded. The sign of negative values is preserved (`-0.001`).
- **Very small or very large magnitudes expand fully.** `new Decimal('1e-30')` becomes a 30 decimal place literal; that is intentional (lossless), but keep URL length limits in mind.
- **Precision comes from the `Decimal` you pass in.** This strategy never re-rounds, so if the value was already truncated by a `Decimal.clone({ precision })` operation, the truncation is what gets serialized.
- The neutral literal only travels one hop: pair it with a value-to strategy whose `canHandle` recognizes `DecimalComponents`. Registering the from-strategy alone means the object `{ decimal: '12.5' }` reaches the fallback `String(value)` path.

---

## 🔗 Related packages

- Outputs: [`-value-to-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-decimal) (`DecimalStringValueToStrategy`, `DecimalFixedValueToStrategy`, `DecimalNumberValueToStrategy`, `DecimalExponentialValueToStrategy`)
- Other inputs: [`-value-from-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-uuid), [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

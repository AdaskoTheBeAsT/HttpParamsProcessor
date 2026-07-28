# 🧮 @adaskothebeast/http-params-processor-value-to-decimal

**Decimal output strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): plain literals, fixed decimal places, number literals and exponential notation.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-to-decimal?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-decimal)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `core` + `decimal.js` (types ship with `decimal.js`, no companion `@types` package). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-to-decimal @adaskothebeast/http-params-processor-core decimal.js
```

---

## 🎯 What it does

These are **value-to** strategies: the second half of the conversion pipeline. Each one consumes the neutral `DecimalComponents` shape from `core` (`{ decimal: string }`) - normally produced by [`-value-from-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-decimal) - and renders it as a query string value.

| Class                               | Renders as                        | Example output                             |
| ----------------------------------- | --------------------------------- | ------------------------------------------ |
| `DecimalStringValueToStrategy`      | the lossless literal, verbatim    | `12345678901234567890.1234567890123456789` |
| `DecimalFixedValueToStrategy`       | fixed decimal places (money)      | `12.50`                                    |
| `DecimalNumberValueToStrategy`      | JavaScript number literal         | `12.5`                                     |
| `DecimalExponentialValueToStrategy` | exponential / scientific notation | `1.25e+8`                                  |

`DecimalStringValueToStrategy` is the safe default: it is the format ASP.NET Core, Rails and Spring decimal binders expect, and it is the only one of the four that cannot lose a digit.

---

## ⚡ Usage

```ts
import { ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { DecimalValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-decimal';
import { DecimalFixedValueToStrategy, DecimalStringValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-decimal';
import Decimal from 'decimal.js';

const processor = new ParamsProcessor({
  valueConverters: [createValueConverter(new DecimalValueFromStrategy(), new DecimalStringValueToStrategy())],
});

processor.process('p', { total: new Decimal('12.5') });
// [['p.total', '12.5']]

// money oriented processor: always two decimal places
const money = new ParamsProcessor({
  valueConverters: [createValueConverter(new DecimalValueFromStrategy(), new DecimalFixedValueToStrategy(2))],
});

money.process('p', { total: new Decimal('12.5') });
// [['p.total', '12.50']]
```

---

## 🎛️ Options and configuration

| Class                               | Constructor                                                  | Defaults                                                   |
| ----------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `DecimalStringValueToStrategy`      | `new DecimalStringValueToStrategy()`                         | no options                                                 |
| `DecimalFixedValueToStrategy`       | `new DecimalFixedValueToStrategy(decimalPlaces?, rounding?)` | `decimalPlaces = 2`, `rounding = Decimal.ROUND_HALF_UP`    |
| `DecimalNumberValueToStrategy`      | `new DecimalNumberValueToStrategy()`                         | no options                                                 |
| `DecimalExponentialValueToStrategy` | `new DecimalExponentialValueToStrategy(significantDigits?)`  | `significantDigits = undefined` (as many digits as needed) |

- `rounding` is any `decimal.js` rounding constant (`Decimal.ROUND_HALF_UP`, `Decimal.ROUND_DOWN`, …) and is forwarded to `Decimal.prototype.toFixed(decimalPlaces, rounding)`.
- `significantDigits` is forwarded to `Decimal.prototype.toExponential`, which interprets it as the number of digits **after** the decimal point, so `2` renders `125400000` as `1.25e+8`.

All four strategies share the same `canHandle`, a structural guard over `DecimalComponents`: an object whose `decimal` property is a string matching `/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/`.

| `canHandle` input        | Result                                             |
| ------------------------ | -------------------------------------------------- |
| `{ decimal: '-0.5' }`    | `true`                                             |
| `{ decimal: '1.25e+8' }` | `false` (exponential input is not a plain literal) |
| `{ decimal: 'abc' }`     | `false`                                            |
| `'1.5'`                  | `false` (a bare string is never claimed)           |
| `null`                   | `false`                                            |

---

## 📤 Output examples

```ts
new DecimalStringValueToStrategy().serializeValue({
  decimal: '12345678901234567890.1234567890123456789',
});
// '12345678901234567890.1234567890123456789'
```

| Strategy                                                 | `DecimalComponents`        | Output    |
| -------------------------------------------------------- | -------------------------- | --------- |
| `new DecimalFixedValueToStrategy()`                      | `{ decimal: '12.5' }`      | `12.50`   |
| `new DecimalFixedValueToStrategy(2)`                     | `{ decimal: '1.005' }`     | `1.01`    |
| `new DecimalFixedValueToStrategy(2)`                     | `{ decimal: '1.004' }`     | `1.00`    |
| `new DecimalFixedValueToStrategy(0, Decimal.ROUND_DOWN)` | `{ decimal: '1.9' }`       | `1`       |
| `new DecimalNumberValueToStrategy()`                     | `{ decimal: '12.50' }`     | `12.5`    |
| `new DecimalNumberValueToStrategy()`                     | `{ decimal: '-0.001' }`    | `-0.001`  |
| `new DecimalExponentialValueToStrategy()`                | `{ decimal: '125000000' }` | `1.25e+8` |
| `new DecimalExponentialValueToStrategy(2)`               | `{ decimal: '125400000' }` | `1.25e+8` |

---

## ⚠️ Edge cases

- `DecimalNumberValueToStrategy` **throws** when the literal cannot become a finite double:

  ```text
  Error: Decimal '<literal>' cannot be represented as a finite number
  ```

  This is deliberate - silently emitting `Infinity` would be worse. Use `DecimalStringValueToStrategy` for values outside the double range.

- `DecimalNumberValueToStrategy` also **drops trailing zeros** (`'12.50'` → `12.5`) and can lose digits beyond 17 significant figures, because the value passes through `Number`. Never use it for money you intend to compare byte for byte.
- `DecimalFixedValueToStrategy` **rounds**, it does not validate. `1.005` becomes `1.01` with the default half-up mode, while `Decimal.ROUND_DOWN` truncates instead (`1.9` → `1` at zero decimal places).
- `DecimalExponentialValueToStrategy` output always carries an explicit sign in the exponent (`1.25e+8`, `1e-7`). Round-tripping it needs a backend that accepts scientific notation.
- Exponential **inputs** are rejected by `canHandle`, so `{ decimal: '1.25e+8' }` is not claimed by any of these strategies. `DecimalValueFromStrategy` never produces such a literal (it uses `toFixed()`), so this only matters if you build `DecimalComponents` by hand.
- Only one converter can win per value: converters are tried in registration order and the first matching `canHandle` claims the value. Since all four strategies accept exactly the same input shape, register at most one decimal converter per processor - or branch by key with separate processors.
- These strategies do not depend on the _from_ side at runtime; anything that produces `{ decimal: '<plain literal>' }` works, including your own `bigint` or string based normalizer.

---

## 🔗 Related packages

- Inputs: [`-value-from-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-decimal)
- Other outputs: [`-value-to-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-uuid), [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

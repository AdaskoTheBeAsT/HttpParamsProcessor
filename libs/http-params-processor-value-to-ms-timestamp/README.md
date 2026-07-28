# ⏲️ @adaskothebeast/http-params-processor-value-to-ms-timestamp

**Millisecond timestamp output strategy for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): dates as epoch milliseconds, for example `1704067200000`.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-to-ms-timestamp?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Core only, zero runtime dependencies. ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-to-ms-timestamp @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

This is a **value-to** strategy: the second half of the conversion pipeline. Pair it with a **value-from** strategy (`-value-from-luxon`, `-value-from-dayjs`, `-value-from-moment`, `-value-from-js-joda`, or the `DefaultDateValueFromStrategy` from `core`) using `createValueConverter`.

| Class                        | Serializes | Example output  |
| ---------------------------- | ---------- | --------------- |
| `MsTimestampValueToStrategy` | `Date`     | `1704067200000` |

The output is exactly `Date.prototype.getTime()`, the number JavaScript itself uses internally. It is therefore **lossless**: feeding the string back into `new Date(Number(value))` reproduces the original instant to the millisecond. That makes it the natural choice for Node/JVM backends, Elasticsearch `epoch_millis`, and cursor style pagination where two events can share a second.

---

## ⚡ Usage

```ts
import { DefaultDateValueFromStrategy, ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { LuxonDateTimeValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { MsTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-ms-timestamp';
import { DateTime } from 'luxon';

const processor = new ParamsProcessor({
  valueConverters: [
    createValueConverter(new LuxonDateTimeValueFromStrategy(), new MsTimestampValueToStrategy()),
    // keep native Dates working too
    createValueConverter(new DefaultDateValueFromStrategy(), new MsTimestampValueToStrategy()),
  ],
});

processor.process('p', {
  from: DateTime.fromISO('2024-01-01T00:00:00.123Z'),
  to: new Date('2024-06-15T14:30:45.500Z'),
});
// [['p.from', '1704067200123'], ['p.to', '1718461845500']]
```

Only dates are covered here. If the same request also carries durations or periods, register a converter for them with [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso) or [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime).

---

## 🎛️ Options and formats

No constructor options - the output is always `date.getTime()` rendered as a decimal string.

| Rule              | Behaviour                                                        |
| ----------------- | ---------------------------------------------------------------- |
| Unit              | Whole milliseconds since `1970-01-01T00:00:00Z`                  |
| Time zone         | None. The instant is absolute, so the local offset never appears |
| Sub-second digits | Preserved exactly, no rounding and no truncation                 |
| Type              | `string` (a decimal integer, no exponent notation, no `+` sign)  |

Compared with the sibling [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp) package:

| Instant                    | ms-timestamp    | unix-timestamp |
| -------------------------- | --------------- | -------------- |
| `2024-01-01T00:00:00.000Z` | `1704067200000` | `1704067200`   |
| `2024-01-01T00:00:00.123Z` | `1704067200123` | `1704067200`   |
| `2024-01-01T00:00:00.999Z` | `1704067200999` | `1704067200`   |

---

## 📤 Output examples

```text
p.from=1704067200000       # 2024-01-01T00:00:00.000Z
p.exact=1704067200123      # 2024-01-01T00:00:00.123Z, milliseconds preserved
p.to=1718461845500         # 2024-06-15T14:30:45.500Z
p.epoch=0                  # 1970-01-01T00:00:00.000Z
p.moon=-14182940000        # 1969-07-20T20:17:40.000Z, pre-epoch dates are negative
```

---

## ⚠️ Edge cases

- `canHandle` accepts **only real `Date` instances**. Strings such as `'2024-01-01'` and already-numeric timestamps such as `1704067200000` are rejected, so they fall through to the next converter and reach the default serialization untouched.
- **Invalid dates** (`new Date('invalid')`) are rejected, so `NaN` never reaches the query string.
- Pre-1970 dates serialize as negative integers. Backends that parse the parameter into an unsigned type will reject them.
- The number is well inside `Number.MAX_SAFE_INTEGER` for any realistic date, so no precision is lost in JavaScript - but a backend that parses it into a 32-bit integer will overflow immediately, since even a present day instant needs far more than 32 bits in milliseconds.
- The value is timezone agnostic by design. A parameter meant to be a **local calendar day** should not be an epoch timestamp; use [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns) with `yyyy-MM-dd` instead.
- Sub-millisecond precision from richer libraries (Luxon, Temporal, `js-joda` nanoseconds) is already gone by the time the value reaches this strategy, because the neutral shape handed over by every value-from strategy is a JavaScript `Date`.
- Timestamps are opaque in logs and dashboards. If a human reads the query string, prefer [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), which is equally lossless.

---

## 🔗 Related packages

- Inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Other outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

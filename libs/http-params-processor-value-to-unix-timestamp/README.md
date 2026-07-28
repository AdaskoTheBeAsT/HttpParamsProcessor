# ⏱️ @adaskothebeast/http-params-processor-value-to-unix-timestamp

**Unix timestamp output strategy for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): dates as whole seconds since the epoch, for example `1704067200`.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-to-unix-timestamp?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Core only, zero runtime dependencies. ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-to-unix-timestamp @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

This is a **value-to** strategy: the second half of the conversion pipeline. Pair it with a **value-from** strategy (`-value-from-luxon`, `-value-from-dayjs`, `-value-from-moment`, `-value-from-js-joda`, or the `DefaultDateValueFromStrategy` from `core`) using `createValueConverter`.

| Class                          | Serializes | Example output |
| ------------------------------ | ---------- | -------------- |
| `UnixTimestampValueToStrategy` | `Date`     | `1704067200`   |

This is the classic POSIX / `time_t` shape used by JWT `exp`/`iat`, most REST APIs written in Go, Python, PHP or Rust, and by anything that stores time as an integer column. It carries no time zone and no sub-second precision, so the value is unambiguous but lossy.

---

## ⚡ Usage

```ts
import { DefaultDateValueFromStrategy, ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { LuxonDateTimeValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { UnixTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-unix-timestamp';
import { DateTime } from 'luxon';

const processor = new ParamsProcessor({
  valueConverters: [
    createValueConverter(new LuxonDateTimeValueFromStrategy(), new UnixTimestampValueToStrategy()),
    // keep native Dates working too
    createValueConverter(new DefaultDateValueFromStrategy(), new UnixTimestampValueToStrategy()),
  ],
});

processor.process('p', {
  from: DateTime.fromISO('2024-01-01T00:00:00Z'),
  to: new Date('2024-06-15T14:30:45.000Z'),
});
// [['p.from', '1704067200'], ['p.to', '1718461845']]
```

Only dates are covered here. If the same request also carries durations or periods, register a converter for them with [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso) or [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime).

---

## 🎛️ Options and formats

No constructor options - the output is always `Math.floor(date.getTime() / 1000)` rendered as a decimal string.

| Rule              | Behaviour                                                                    |
| ----------------- | ---------------------------------------------------------------------------- |
| Unit              | Whole seconds since `1970-01-01T00:00:00Z`                                   |
| Time zone         | None. The instant is absolute, so the local offset never appears in output   |
| Sub-second digits | Discarded (`Math.floor`, so the value is rounded **down**, never rounded up) |
| Type              | `string` (a decimal integer, no quotes, no `+` sign)                         |

Because the truncation uses `Math.floor` and not `Math.trunc`, it always moves toward the past, on both sides of the epoch:

- `2024-01-01T00:00:00.999Z` → `1704067200` (the `.999` is dropped),
- `1969-12-31T23:59:59.500Z` (`getTime()` is `-500`) → `-1`, not `0`.

If your backend expects rounding to the nearest second, round the `Date` before it reaches the processor.

---

## 📤 Output examples

```text
p.from=1704067200          # 2024-01-01T00:00:00.000Z
p.tail=1704067200          # 2024-01-01T00:00:00.999Z, milliseconds truncated
p.to=1718461845            # 2024-06-15T14:30:45.000Z
p.epoch=0                  # 1970-01-01T00:00:00.000Z
p.moon=-14182940           # 1969-07-20T20:17:40.000Z, pre-epoch dates are negative
```

---

## ⚠️ Edge cases

- `canHandle` accepts **only real `Date` instances**. Strings such as `'2024-01-01'`, already-numeric timestamps such as `1704067200`, and `null` are rejected, so they fall through to the next converter and reach the default serialization untouched.
- **Invalid dates** (`new Date('invalid')`) are rejected too, so a broken input never turns into `NaN` in the query string.
- Sub-second precision is **lost**. Two instants inside the same second collapse to the same parameter value, which matters for cursor style pagination; use [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp) when you need milliseconds.
- Pre-1970 dates serialize as negative integers. Some backends parse them into unsigned types and fail; verify before using this strategy for historical data.
- The value is timezone agnostic by design. A parameter meant to be a **local calendar day** (a birthday, an invoice date) should not be a Unix timestamp, because the receiving side has no way to know which day you meant. Use [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns) with `yyyy-MM-dd` for that.
- Beyond `2038-01-19T03:14:07Z` the value exceeds a signed 32-bit integer. JavaScript is fine with it, older backends are not.

---

## 🔗 Related packages

- Inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Other outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

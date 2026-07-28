# 🗓️ @adaskothebeast/http-params-processor-value-to-date-fns

**Custom date formatting for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor) powered by [date-fns](https://date-fns.org/): any format token string you like, `yyyy-MM-dd` by default.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-to-date-fns?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `date-fns ^4.4.0` plus `core`. Types ship with `date-fns`. ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-to-date-fns @adaskothebeast/http-params-processor-core date-fns
```

---

## 🎯 What it does

This is a **value-to** strategy: the second half of the conversion pipeline. Pair it with a **value-from** strategy (`-value-from-luxon`, `-value-from-dayjs`, `-value-from-moment`, `-value-from-js-joda`, or the `DefaultDateValueFromStrategy` from `core`) using `createValueConverter`.

| Class                    | Serializes | Example output                            |
| ------------------------ | ---------- | ----------------------------------------- |
| `DateFnsValueToStrategy` | `Date`     | `2024-01-15` (default), `01/15/2024`, ... |

Use it when the backend wants a **specific human readable shape** rather than an ISO instant or an epoch number: a date-only `yyyy-MM-dd` filter, a US style `MM/dd/yyyy` report parameter, a `yyyyMM` bucket key, and so on. Only dates are supported; durations and periods are not part of this package.

---

## ⚡ Usage

```ts
import { DefaultDateValueFromStrategy, ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { LuxonDateTimeValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { DateFnsValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-date-fns';
import { DateTime } from 'luxon';

const processor = new ParamsProcessor({
  valueConverters: [
    createValueConverter(
      new LuxonDateTimeValueFromStrategy(),
      new DateFnsValueToStrategy(), // yyyy-MM-dd
    ),
    // keep native Dates working too
    createValueConverter(new DefaultDateValueFromStrategy(), new DateFnsValueToStrategy()),
  ],
});

processor.process('p', {
  day: DateTime.fromISO('2024-01-15T10:30:00Z'),
});
// [['p.day', '2024-01-15']]
```

A different format is a constructor argument:

```ts
const usDate = new DateFnsValueToStrategy('MM/dd/yyyy');
usDate.serializeValue(new Date('2024-01-15T00:00:00.000Z')); // '01/15/2024'

const localDateTime = new DateFnsValueToStrategy("yyyy-MM-dd'T'HH:mm:ss");
localDateTime.serializeValue(new Date('2024-01-15T10:30:45.000Z'));
// '2024-01-15T11:30:45' in UTC+1, '2024-01-15T10:30:45' in UTC
```

Because the format lives on the instance, you can register **several converters with different formats** and let the value-from strategies decide which one claims a value, or build one processor per endpoint shape.

---

## 🎛️ Options and formats

| Constructor parameter | Type     | Default        | Meaning                                    |
| --------------------- | -------- | -------------- | ------------------------------------------ |
| `formatString`        | `string` | `'yyyy-MM-dd'` | Passed straight to `format(date, pattern)` |

That single argument is the whole API. `serializeValue` calls `format(value, this.formatString)` from `date-fns` with **no options object**, which has two consequences worth knowing:

- formatting happens in the **runtime local time zone**, since that is what `format` does,
- `date-fns` options such as `locale`, `weekStartsOn`, `useAdditionalDayOfYearTokens` and `useAdditionalWeekYearTokens` cannot be forwarded. If you need locale aware month or weekday names, format the value yourself before it reaches the processor.

Any Unicode token string that `date-fns` accepts works:

| `formatString`          | Output for `2024-01-15T10:30:45Z` (in UTC) |
| ----------------------- | ------------------------------------------ |
| `yyyy-MM-dd` (default)  | `2024-01-15`                               |
| `MM/dd/yyyy`            | `01/15/2024`                               |
| `dd.MM.yyyy`            | `15.01.2024`                               |
| `yyyy-MM-dd HH:mm`      | `2024-01-15 10:30`                         |
| `yyyy-MM-dd'T'HH:mm:ss` | `2024-01-15T10:30:45`                      |
| `yyyyMMdd`              | `20240115`                                 |
| `yyyy-MM`               | `2024-01`                                  |

---

## 📤 Output examples

```text
p.day=2024-01-15
p.reportDate=01%2F15%2F2024
p.bucket=2024-01
p.stampedAt=2024-01-15T10%3A30%3A45
```

---

## ⚠️ Edge cases

- **Local time zone, not UTC.** `format` renders wall-clock time in whatever zone the process runs in, so `2024-01-15T23:30:00Z` becomes `2024-01-16` in UTC+2 and `2024-01-15` in UTC. Pin `TZ` in CI, or convert to the intended zone before serializing (`date-fns-tz`, or the corresponding helper of your date library).
- **Protected tokens throw.** In `date-fns` v2 and later, `YYYY`, `YY`, `D` and `DD` raise a `RangeError` telling you to use `yyyy`, `yy`, `d` or `dd`, because `Y` means week-numbering year and `D` means day of year. Since this strategy passes no options object, the escape hatches (`useAdditionalWeekYearTokens`, `useAdditionalDayOfYearTokens`) are unreachable - just use the lowercase tokens.
- The format string is **not validated at construction time**. A bad pattern only fails when the first value is serialized, i.e. during `process`.
- Literal text must be quoted with single quotes (`"yyyy-MM-dd'T'HH:mm:ss"`), otherwise letters are interpreted as tokens. A literal single quote is written as `''`.
- `canHandle` accepts **only real `Date` instances** and rejects **invalid dates** (`new Date('invalid')`), which also keeps `format` from throwing `Invalid time value`. Strings such as `'2024-01-01'` are rejected as well and fall through to the next converter.
- Date-only formats are **lossy**: `yyyy-MM-dd` drops the time, so a range filter built from two timestamps silently widens to whole days.
- `date-fns` is a **peer dependency**, so the consumer controls the version, and locale or time zone helpers stay optional sub-imports that this package never pulls in.
- If you only need a UTC ISO instant, [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso) does it without any dependency.

---

## 🔗 Related packages

- Inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Other outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

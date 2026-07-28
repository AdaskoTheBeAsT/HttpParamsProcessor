# 🕰️ @adaskothebeast/http-params-processor-value-to-iso

**ISO 8601 output strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): dates, durations and periods as `2024-01-15T10:30:00.000Z`, `PT1H30M45S`, `P1Y6M15D`.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-to-iso?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core`. ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-to-iso @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

These are **value-to** strategies: the second half of the conversion pipeline. Pair each of them with a **value-from** strategy (`-value-from-luxon`, `-value-from-dayjs`, `-value-from-moment`, `-value-from-js-joda`, or the `DefaultDateValueFromStrategy` from `core`) using `createValueConverter`.

| Class                        | Serializes           | Example output             |
| ---------------------------- | -------------------- | -------------------------- |
| `IsoDateValueToStrategy`     | `Date`               | `2024-01-15T10:30:00.000Z` |
| `IsoDurationValueToStrategy` | `DurationComponents` | `PT1H30M45S`, `P1Y2M3DT4H` |
| `IsoPeriodValueToStrategy`   | `PeriodComponents`   | `P1Y6M15D`                 |

---

## ⚡ Usage

```ts
import { DefaultDateValueFromStrategy, ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { LuxonDateTimeValueFromStrategy, LuxonDurationValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { IsoDateValueToStrategy, IsoDurationValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-iso';
import { DateTime, Duration } from 'luxon';

const processor = new ParamsProcessor({
  valueConverters: [
    createValueConverter(new LuxonDateTimeValueFromStrategy(), new IsoDateValueToStrategy()),
    createValueConverter(new LuxonDurationValueFromStrategy(), new IsoDurationValueToStrategy()),
    // keep native Dates working too
    createValueConverter(new DefaultDateValueFromStrategy(), new IsoDateValueToStrategy()),
  ],
});

processor.process('p', {
  from: DateTime.fromISO('2024-01-15T10:30:00Z'),
  window: Duration.fromObject({ hours: 1, minutes: 30, seconds: 45 }),
});
// [['p.from', '2024-01-15T10:30:00.000Z'], ['p.window', 'PT1H30M45S']]
```

---

## 🎛️ Options and formats

No constructor options - the output format is fixed by ISO 8601.

**Dates** use `Date.prototype.toISOString()`: always UTC (`Z`), always with milliseconds. There is no local-time or offset variant here; if you need a different shape use [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns).

**Durations** emit `P[n]Y[n]M[n]W[n]DT[n]H[n]M[n]S`:

| `DurationComponents` input                   | Output       |
| -------------------------------------------- | ------------ |
| `{ hours: 1, minutes: 30, seconds: 45 }`     | `PT1H30M45S` |
| `{ years: 1, months: 2, days: 3, hours: 4 }` | `P1Y2M3DT4H` |
| `{ weeks: 2 }`                               | `P2W`        |
| `{ seconds: 1, milliseconds: 500 }`          | `PT1.5S`     |
| `{ milliseconds: 250 }`                      | `PT0.25S`    |
| `{}` / all zeros                             | `PT0S`       |

**Periods** emit `P[n]Y[n]M[n]W[n]D`, with `P0D` for an empty period. Periods are calendar-based, so nothing is normalized: `{ months: 18 }` stays `P18M`.

---

## ⚠️ Edge cases

- `IsoDateValueToStrategy.canHandle` rejects **invalid dates** (`new Date('nope')`), so they fall through to the next converter instead of producing `Invalid Date`.
- Zero and `undefined` components are omitted, which is why `{ hours: 0, minutes: 5 }` becomes `PT5M`.
- `milliseconds` are folded into the seconds field as a decimal fraction (`PT1.5S`), never emitted as their own designator.
- Fractional `weeks` are written verbatim (`{ weeks: 1.5 }` → `P1.5W`); convert to days first if your backend is strict.
- Duration and period detection are **structural** (a plain object with at least one numeric duration/period key). `{ years: 1, months: 6 }` satisfies both strategies, so whichever converter you register first claims it - register the period converter first if such objects should be treated as calendar periods.
- `PeriodComponents` cannot express time-of-day; hours/minutes/seconds are silently ignored by `IsoPeriodValueToStrategy.canHandle` (such objects are treated as durations instead).

---

## 🔗 Related packages

- Inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Other outputs: [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

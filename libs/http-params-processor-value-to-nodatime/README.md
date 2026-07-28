# 🧭 @adaskothebeast/http-params-processor-value-to-nodatime

**NodaTime friendly output strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): dates, durations and periods shaped the way a .NET NodaTime backend parses them (`2024-01-01T00:00:00.000Z`, `PT26H`, `P1Y6M`).**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-to-nodatime?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Core only, zero runtime dependencies. ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-to-nodatime @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

These are **value-to** strategies: the second half of the conversion pipeline. Pair each of them with a **value-from** strategy (`-value-from-luxon`, `-value-from-dayjs`, `-value-from-moment`, `-value-from-js-joda`, or the `DefaultDateValueFromStrategy` from `core`) using `createValueConverter`.

| Class                             | Serializes           | Example output             |
| --------------------------------- | -------------------- | -------------------------- |
| `NodaTimeDateValueToStrategy`     | `Date`               | `2024-01-01T00:00:00.000Z` |
| `NodaTimeDurationValueToStrategy` | `DurationComponents` | `PT1H30M`, `PT26H`         |
| `NodaTimePeriodValueToStrategy`   | `PeriodComponents`   | `P1Y6M`, `P2W`             |

The split mirrors NodaTime's own type system: `Instant`/`OffsetDateTime` for a point in time, `Duration` for an exact elapsed time, `Period` for a calendar amount. Sending a calendar shape where the server expects an exact time (or the other way round) is the usual source of NodaTime parse failures, so pick the strategy that matches the target property.

---

## ⚡ Usage

```ts
import { DefaultDateValueFromStrategy, ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { LuxonDateTimeValueFromStrategy, LuxonDurationValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-luxon';
import { NodaTimeDateValueToStrategy, NodaTimeDurationValueToStrategy, NodaTimePeriodValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-nodatime';
import { DateTime, Duration } from 'luxon';

const processor = new ParamsProcessor({
  valueConverters: [
    createValueConverter(new LuxonDateTimeValueFromStrategy(), new NodaTimeDateValueToStrategy()),
    // register the period converter first if plain objects should be calendar amounts
    createValueConverter(new LuxonDurationValueFromStrategy(), new NodaTimePeriodValueToStrategy()),
    createValueConverter(new LuxonDurationValueFromStrategy(), new NodaTimeDurationValueToStrategy()),
    // keep native Dates working too
    createValueConverter(new DefaultDateValueFromStrategy(), new NodaTimeDateValueToStrategy()),
  ],
});

processor.process('p', {
  at: DateTime.fromISO('2024-01-01T00:00:00Z'),
  window: Duration.fromObject({ hours: 1, minutes: 30 }),
});
// [['p.at', '2024-01-01T00:00:00.000Z'], ['p.window', 'PT1H30M']]
```

---

## 🎛️ Options and formats

No constructor options - every output shape is fixed.

**Dates** use `Date.prototype.toISOString()`: always UTC (`Z`), always with milliseconds. That is exactly what NodaTime's `InstantPattern.ExtendedIso` and `Instant.FromDateTimeOffset` round-trip, so no server side pattern configuration is needed.

**Durations** are time only. NodaTime's `Duration` has no calendar fields, so the strategy normalizes before writing `PT[n]H[n]M[n]S`:

- `days` are folded into hours as `hours + days * 24` (a NodaTime `Duration` day is always exactly 24 hours, unlike a `Period` day),
- `milliseconds` are folded into the seconds field as a decimal fraction (`milliseconds / 1000`),
- `years`, `months` and `weeks` are **not** part of a `Duration` and are dropped,
- zero components are omitted, and an all-zero duration becomes `PT0S`.

| `DurationComponents` input          | Output    |
| ----------------------------------- | --------- |
| `{ hours: 1, minutes: 30 }`         | `PT1H30M` |
| `{ days: 1, hours: 2 }`             | `PT26H`   |
| `{ seconds: 1, milliseconds: 500 }` | `PT1.5S`  |
| `{ milliseconds: 250 }`             | `PT0.25S` |
| `{}` / all zeros                    | `PT0S`    |

**Periods** are calendar based and are written verbatim as `P[n]Y[n]M[n]W[n]D` with no normalization at all, because a NodaTime `Period` keeps its units separate. An empty period becomes `P0D`.

| `PeriodComponents` input  | Output  |
| ------------------------- | ------- |
| `{ years: 1, months: 6 }` | `P1Y6M` |
| `{ weeks: 2 }`            | `P2W`   |
| `{ months: 18 }`          | `P18M`  |
| `{}` / all zeros          | `P0D`   |

---

## 📤 Output examples

```text
p.at=2024-01-01T00%3A00%3A00.000Z
p.window=PT1H30M
p.uptime=PT26H
p.precise=PT1.5S
p.contract=P1Y6M
p.sprint=P2W
p.empty=P0D
```

---

## ⚠️ Edge cases

- `NodaTimeDateValueToStrategy.canHandle` rejects **invalid dates** (`new Date('invalid')`), so they fall through to the next converter instead of producing `Invalid Date`.
- Duration and period detection are **structural**, and the two strategies are deliberately disjoint:
  - `NodaTimeDurationValueToStrategy.canHandle` needs at least one numeric `days`/`hours`/`minutes`/`seconds`/`milliseconds` key, so `{ years: 1, months: 2 }` is rejected.
  - `NodaTimePeriodValueToStrategy.canHandle` accepts an object only when **every** key is `years`/`months`/`weeks`/`days` (or has an `undefined` value) and at least one of them is a number, so `{ hours: 1 }` is rejected.
  - `{ days: 3 }` matches **both** (it is a valid period and a valid duration). Whichever converter you register first claims it, so register the period converter first if bare day counts are calendar amounts in your API.
- `{ years: 1, hours: 2 }` is handled as a duration and serializes to `PT2H`: the `years` field is silently dropped, because NodaTime cannot express years in a `Duration`. Split such values into a separate period parameter.
- `weeks` are dropped by the duration strategy as well; convert weeks to days (or hours) before serializing if the target property is a `Duration`.
- Fractional components are written verbatim (`{ hours: 1.5 }` → `PT1.5H`). NodaTime parses fractional seconds, but not fractional hours or minutes, so normalize first when the value can be fractional.
- Because `days` fold into hours, a duration that spans a DST transition is **not** wall-clock corrected. Use `NodaTimePeriodValueToStrategy` (a NodaTime `Period`, applied in a calendar) when you need "same time next day" semantics.
- `PeriodComponents` cannot express time-of-day; objects that carry hours/minutes/seconds are treated as durations instead.

---

## 🔗 Related packages

- Inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Other outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

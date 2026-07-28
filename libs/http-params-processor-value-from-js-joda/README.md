# 🗓️ @adaskothebeast/http-params-processor-value-from-js-joda

**js-joda input strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): normalize `LocalDate`, `LocalDateTime`, `ZonedDateTime`, `Duration` and `Period` values before they are serialized.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-from-js-joda?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `core` and `@js-joda/core` (`^6.1.0`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-from-js-joda @adaskothebeast/http-params-processor-core @js-joda/core
```

Add the time zone database as well if you pass `ZonedDateTime` values built from IANA zone ids - `@js-joda/core` alone only knows UTC, fixed offsets and the system zone:

```bash
npm i @js-joda/timezone
```

---

## 🎯 What it does

These are **value-from** strategies: the first half of the conversion pipeline. Each one normalizes a js-joda type into a neutral shape and must be paired with a **value-to** strategy (`-value-to-iso`, `-value-to-nodatime`, `-value-to-unix-timestamp`, `-value-to-ms-timestamp`, `-value-to-date-fns`) through `createValueConverter`.

| Class                              | Accepts                                                      | Produces                                                                |
| ---------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `JsJodaLocalDateValueFromStrategy` | `LocalDate`, `LocalDateTime`, `ZonedDateTime` (`instanceof`) | `Date` (`convert(value).toDate()`)                                      |
| `JsJodaDurationValueFromStrategy`  | `Duration` (`instanceof`)                                    | `DurationComponents` with `hours`, `minutes`, `seconds`, `milliseconds` |
| `JsJodaPeriodValueFromStrategy`    | `Period` (`instanceof`)                                      | `PeriodComponents` with `years`, `months`, `days`                       |

js-joda is the only supported input library that separates a **`Duration`** (exact time, always rendered as hours and below) from a **`Period`** (calendar amount, always rendered as years, months and days), which maps one-to-one onto the two neutral shapes in `core`.

---

## ⚡ Usage

```ts
import { ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { JsJodaDurationValueFromStrategy, JsJodaLocalDateValueFromStrategy, JsJodaPeriodValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-js-joda';
import { IsoDateValueToStrategy, IsoDurationValueToStrategy, IsoPeriodValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-iso';
import { Duration, LocalDateTime, Period } from '@js-joda/core';

const processor = new ParamsProcessor({
  valueConverters: [createValueConverter(new JsJodaLocalDateValueFromStrategy(), new IsoDateValueToStrategy()), createValueConverter(new JsJodaPeriodValueFromStrategy(), new IsoPeriodValueToStrategy()), createValueConverter(new JsJodaDurationValueFromStrategy(), new IsoDurationValueToStrategy())],
});

processor.process('p', {
  from: LocalDateTime.of(2024, 1, 15, 10, 30, 45),
  window: Duration.ofHours(2).plusMinutes(30),
  term: Period.of(1, 2, 3),
});
// p.from is the instant of 2024-01-15T10:30:45 in the system zone
// p.window = 'PT2H30M', p.term = 'P1Y2M3D'
```

---

## 🎛️ Options and configuration

No strategy takes constructor options - all three are stateless and safe to share between processors.

**Local types are resolved in the system zone.** `convert(value).toDate()` is called without an explicit zone, so a `LocalDate` becomes local midnight and a `LocalDateTime` becomes that local wall-clock time. With the ISO writer (which always emits UTC) `LocalDate.of(2024, 1, 15)` in `Europe/Warsaw` serializes as `2024-01-14T23:00:00.000Z`. If you need the calendar date to survive verbatim, either send `localDate.toString()` as a plain string or convert to a `ZonedDateTime` in UTC yourself:

```ts
import { LocalDate, ZoneOffset } from '@js-joda/core';

LocalDate.of(2024, 1, 15).atStartOfDay(ZoneOffset.UTC);
// -> 2024-01-15T00:00:00.000Z
```

**`ZonedDateTime` keeps the instant**, so the zone or offset it was built with is applied correctly and then dropped.

**Register the period converter before the duration converter** if both are in play. They cannot collide on js-joda values (`instanceof` checks are exact), but the ISO writers detect the neutral shapes structurally, so keeping the period pair first matches the ordering recommended by [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso).

---

## 📤 Output examples

Paired with `-value-to-iso`:

| Value passed to `process`                     | Normalized shape                   | Serialized                                      |
| --------------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| `LocalDate.of(2024, 1, 15)`                   | `Date` (local midnight)            | `2024-01-14T23:00:00.000Z` (in `Europe/Warsaw`) |
| `LocalDateTime.of(2024, 1, 15, 10, 30, 45)`   | `Date` (local wall clock)          | `2024-01-15T09:30:45.000Z` (in `Europe/Warsaw`) |
| `ZonedDateTime.parse('2024-01-15T10:30:00Z')` | `Date` (instant)                   | `2024-01-15T10:30:00.000Z`                      |
| `Duration.ofHours(2).plusMinutes(30)`         | `{ hours: 2, minutes: 30 }`        | `PT2H30M`                                       |
| `Duration.ofMinutes(90)`                      | `{ hours: 1, minutes: 30 }`        | `PT1H30M`                                       |
| `Duration.ofDays(2)`                          | `{ hours: 48 }`                    | `PT48H`                                         |
| `Duration.ZERO`                               | `{}`                               | `PT0S`                                          |
| `Period.of(1, 2, 3)`                          | `{ years: 1, months: 2, days: 3 }` | `P1Y2M3D`                                       |
| `Period.ofMonths(20)`                         | `{ months: 20 }`                   | `P20M`                                          |
| `Period.ofWeeks(3)`                           | `{ days: 21 }`                     | `P21D`                                          |
| `Period.ZERO`                                 | `{}`                               | `P0D`                                           |

```text
p.window  = PT2H30M
p.term    = P1Y2M3D
```

---

## ⚠️ Edge cases

- **Durations never carry days or larger.** The strategy reads the total seconds and splits them into hours, minutes and seconds, so `Duration.ofDays(2)` becomes `PT48H`, not `P2D`. That is faithful to js-joda semantics (a `Duration` is exact time), but backends expecting `P2D` need a `Period` instead.
- **Sub-millisecond precision is lost.** Nanoseconds are truncated towards zero (`Math.floor(nano / 1_000_000)`), so `Duration.ofNanos(1_500_000)` normalizes to `{ milliseconds: 1 }` and anything below 1 ms disappears.
- **Negative durations are not supported.** The component split assumes a non-negative amount, so `Duration.ofMinutes(-90)` normalizes to `{ hours: -2, minutes: -30 }`, which serializes as `PT-2H-30M` instead of a 90 minute deficit. Send `duration.abs()` and pass the sign as a separate parameter.
- **Periods are never normalized.** `Period.ofMonths(20)` stays `P20M` (js-joda only carries months into years when you call `normalized()`), and weeks are folded into days at construction time, so a `weeks` field is never emitted.
- Zero components are converted to `undefined`; `Duration.ZERO` yields `PT0S` and `Period.ZERO` yields `P0D`.
- **No invalid-value trap.** js-joda throws while constructing an out-of-range value, so unlike Moment, Day.js or Luxon there is no "invalid" object that can slip through `canHandle` and produce `Invalid Date`.
- `Instant`, `OffsetDateTime`, `LocalTime`, `YearMonth` and `MonthDay` are **not** handled. Wrap them first (for example `instant.atZone(ZoneOffset.UTC)`) or send `value.toString()` as a plain string.
- Detection is `instanceof`, so values crossing a realm boundary (iframe, worker, or two copies of `@js-joda/core` in the dependency tree) are not recognized. Keep a single hoisted `@js-joda/core` version.
- A `Duration` or `Period` is not an instant; never pair those strategies with a date writer such as `IsoDateValueToStrategy` - the converter always runs the paired writer, it does not re-check the shape.

---

## 🔗 Related packages

- Outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Other inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

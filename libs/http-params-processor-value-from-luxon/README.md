# 🌞 @adaskothebeast/http-params-processor-value-from-luxon

**Luxon input strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): normalize `DateTime` and `Duration` values before they are serialized.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-from-luxon?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `core` and `luxon` (`^3.7.2`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-from-luxon @adaskothebeast/http-params-processor-core luxon
```

TypeScript users also need the community typings, because Luxon ships none of its own:

```bash
npm i -D @types/luxon
```

No time zone data package is required - Luxon reads IANA zones from the runtime `Intl` data.

---

## 🎯 What it does

These are **value-from** strategies: the first half of the conversion pipeline. Each one normalizes a Luxon type into a neutral shape and must be paired with a **value-to** strategy (`-value-to-iso`, `-value-to-nodatime`, `-value-to-unix-timestamp`, `-value-to-ms-timestamp`, `-value-to-date-fns`) through `createValueConverter`.

| Class                            | Accepts                                        | Produces                                                        |
| -------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `LuxonDateTimeValueFromStrategy` | `DateTime` (detected by `DateTime.isDateTime`) | `Date` (`value.toJSDate()`)                                     |
| `LuxonDurationValueFromStrategy` | `Duration` (detected by `Duration.isDuration`) | `DurationComponents` from `value.toObject()`, including `weeks` |

Luxon is the only supported input library whose durations keep a `weeks` field, so `-value-to-iso` can emit `P2W` for it.

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

## 🎛️ Options and configuration

Neither strategy takes constructor options - both are stateless and safe to share between processors.

**Zones collapse into an instant.** `toJSDate()` keeps the moment in time and drops the zone metadata, so `DateTime.fromISO('2024-01-15T10:30:00', { zone: 'America/New_York' })` becomes `2024-01-15T15:30:00.000Z`. If you need the wall-clock rendering instead, pair the strategy with [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns) and a local format, or convert with `.setZone('utc', { keepLocalTime: true })` first.

**Durations are passed through as authored.** Luxon does not carry units for you, so the components you built the `Duration` with are the components that get serialized. Call `.shiftTo(...)` or `.normalize()` yourself when the backend expects a carried form:

```ts
Duration.fromObject({ minutes: 90 }).shiftTo('hours', 'minutes');
// { hours: 1, minutes: 30 } -> PT1H30M
```

**Output format** is decided by the paired value-to strategy - swap `IsoDateValueToStrategy` for `UnixTimestampValueToStrategy`, `MsTimestampValueToStrategy` or a NodaTime writer without touching the from side.

---

## 📤 Output examples

Paired with `-value-to-iso`:

| Value passed to `process`                                               | Normalized shape                             | Serialized                 |
| ----------------------------------------------------------------------- | -------------------------------------------- | -------------------------- |
| `DateTime.fromISO('2024-01-15T10:30:00Z')`                              | `Date` (instant)                             | `2024-01-15T10:30:00.000Z` |
| `DateTime.fromISO('2024-01-15T10:30:00', { zone: 'America/New_York' })` | `Date` (instant)                             | `2024-01-15T15:30:00.000Z` |
| `Duration.fromObject({ hours: 1, minutes: 30 })`                        | `{ hours: 1, minutes: 30 }`                  | `PT1H30M`                  |
| `Duration.fromObject({ minutes: 90 })`                                  | `{ minutes: 90 }`                            | `PT90M`                    |
| `Duration.fromObject({ weeks: 2 })`                                     | `{ weeks: 2 }`                               | `P2W`                      |
| `Duration.fromISO('PT1.5S')`                                            | `{ seconds: 1, milliseconds: 500 }`          | `PT1.5S`                   |
| `Duration.fromMillis(5400000)`                                          | `{ milliseconds: 5400000 }`                  | `PT5400S`                  |
| `Duration.fromObject({ years: 1, months: 2, days: 3, hours: 4 })`       | `{ years: 1, months: 2, days: 3, hours: 4 }` | `P1Y2M3DT4H`               |

```text
p.from    = 2024-01-15T10:30:00.000Z
p.window  = PT1H30M45S
```

---

## ⚠️ Edge cases

- **Invalid values still pass `canHandle`.** `DateTime.isDateTime` is `true` for `DateTime.invalid(...)` and for anything built from unparsable input, so the value is claimed and normalized to `Invalid Date`; `IsoDateValueToStrategy` then throws `RangeError: Invalid time value` (timestamp writers emit `NaN`). Check `.isValid` before building your params object.
- An invalid `Duration` normalizes to an empty object, which the ISO writer renders as `PT0S` rather than failing loudly.
- Zero components are converted to `undefined`, so `Duration.fromObject({ hours: 0, minutes: 5 })` serializes as `PT5M`.
- **`Duration.fromMillis` is not exploded.** `toObject()` returns a single `milliseconds` field, and the ISO writer folds it into seconds (`PT5400S`). Use `.shiftTo('hours', 'minutes')` when you want `PT1H30M`.
- Fractional components are preserved verbatim: `Duration.fromObject({ weeks: 1.5 })` becomes `P1.5W`, which strict backends may reject.
- Luxon `Interval` is **not** supported; split it into `interval.start` / `interval.end` (both `DateTime`) or into `interval.toDuration()`.
- `Duration` values are not instants, so never pair `LuxonDurationValueFromStrategy` with a date writer - the converter runs whichever writer you paired, it does not re-check the shape.
- `DateTime` and `Duration` detection never overlap, so both converters can be registered in any order; keep `DefaultDateValueFromStrategy` in the list if plain `Date` values also travel through the same processor.

---

## 🔗 Related packages

- Outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Other inputs: [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

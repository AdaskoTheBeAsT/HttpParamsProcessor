# ⏱️ @adaskothebeast/http-params-processor-value-from-moment

**Moment.js input strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): normalize `Moment` instants and `moment.Duration` objects before they are serialized.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-from-moment?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `core` and `moment` (`^2.30.1`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-from-moment @adaskothebeast/http-params-processor-core moment
```

`moment-timezone` is only needed if **your** code builds moments in named IANA zones (`moment.tz(...)`); the strategies themselves never touch zone data.

---

## 🎯 What it does

These are **value-from** strategies: the first half of the conversion pipeline. Each one normalizes a Moment type into a neutral shape and must be paired with a **value-to** strategy (`-value-to-iso`, `-value-to-nodatime`, `-value-to-unix-timestamp`, `-value-to-ms-timestamp`, `-value-to-date-fns`) through `createValueConverter`.

| Class                             | Accepts                                             | Produces                                                                                        |
| --------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `MomentDateValueFromStrategy`     | `Moment` (detected by `moment.isMoment`)            | `Date` (`value.toDate()`)                                                                       |
| `MomentDurationValueFromStrategy` | `moment.Duration` (detected by `moment.isDuration`) | `DurationComponents` (`years`, `months`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`) |

Detection is exact and mutually exclusive: a `Moment` is never claimed by the duration strategy and vice versa, so both converters can be registered side by side.

---

## ⚡ Usage

```ts
import { DefaultDateValueFromStrategy, ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { MomentDateValueFromStrategy, MomentDurationValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-moment';
import { IsoDateValueToStrategy, IsoDurationValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-iso';
import moment from 'moment';

const processor = new ParamsProcessor({
  valueConverters: [
    createValueConverter(new MomentDateValueFromStrategy(), new IsoDateValueToStrategy()),
    createValueConverter(new MomentDurationValueFromStrategy(), new IsoDurationValueToStrategy()),
    // keep native Dates working too
    createValueConverter(new DefaultDateValueFromStrategy(), new IsoDateValueToStrategy()),
  ],
});

processor.process('p', {
  from: moment.utc('2024-01-15T10:30:00.000Z'),
  window: moment.duration({ hours: 1, minutes: 30, seconds: 45 }),
});
// [['p.from', '2024-01-15T10:30:00.000Z'], ['p.window', 'PT1H30M45S']]
```

---

## 🎛️ Options and configuration

Neither strategy takes constructor options - both are stateless and safe to share between processors.

**Zones and UTC mode collapse into an instant.** `toDate()` returns a native `Date`, so `moment.utc(...)`, `moment.parseZone(...)` and `moment.tz(..., 'Asia/Tokyo')` all serialize to the same moment in time; the offset itself is not carried. The paired writer decides the rendering (`-value-to-iso` always emits UTC with `Z`).

**Moment normalizes durations for you.** Unlike Luxon and Day.js, `moment.duration` carries units on construction, so what you get out can differ from what you put in - see the table below.

**Output format** is decided by the paired value-to strategy:

```ts
import { MsTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-ms-timestamp';

createValueConverter(new MomentDateValueFromStrategy(), new MsTimestampValueToStrategy());
```

---

## 📤 Output examples

Paired with `-value-to-iso`:

| Value passed to `process`                            | Normalized shape                         | Serialized                 |
| ---------------------------------------------------- | ---------------------------------------- | -------------------------- |
| `moment.utc('2024-01-15T10:30:00.000Z')`             | `Date` (instant)                         | `2024-01-15T10:30:00.000Z` |
| `moment.duration({ hours: 1, minutes: 30 })`         | `{ hours: 1, minutes: 30 }`              | `PT1H30M`                  |
| `moment.duration({ minutes: 90 })`                   | `{ hours: 1, minutes: 30 }`              | `PT1H30M`                  |
| `moment.duration({ months: 18 })`                    | `{ years: 1, months: 6 }`                | `P1Y6M`                    |
| `moment.duration({ days: 45 })`                      | `{ months: 1, days: 14 }`                | `P1M14D`                   |
| `moment.duration({ weeks: 2 })`                      | `{ days: 14 }`                           | `P14D`                     |
| `moment.duration({ seconds: 1, milliseconds: 500 })` | `{ seconds: 1, milliseconds: 500 }`      | `PT1.5S`                   |
| `moment.duration('PT1H30M45S')`                      | `{ hours: 1, minutes: 30, seconds: 45 }` | `PT1H30M45S`               |

```text
p.from    = 2024-01-15T10:30:00.000Z
p.window  = PT1H30M45S
```

---

## ⚠️ Edge cases

- **Moment carries units, so values change shape.** `{ minutes: 90 }` comes back as 1 hour 30 minutes, `{ months: 18 }` as 1 year 6 months, and large day counts roll into months (`{ days: 45 }` becomes 1 month 14 days, using Moment's approximate 30.4-day month). Send `asDays()`/`asSeconds()` numbers instead if the backend needs the exact unit you authored.
- **Weeks are folded into days.** Moment reports `moment.duration({ weeks: 2 }).days()` as `14`, and the strategy does not map a `weeks` field at all, so you get `P14D`, never `P2W`.
- Zero components are converted to `undefined`, so `{ hours: 1 }` never emits `0` days or minutes, and `moment.duration(0)` normalizes to an empty object (`PT0S` with the ISO writer).
- **Invalid moments still pass `canHandle`.** `moment('nope')` and `moment.invalid()` are `Moment` objects, so they are claimed and normalized to `Invalid Date`; `IsoDateValueToStrategy` then throws `RangeError: Invalid time value` (timestamp writers emit `NaN`). Guard with `.isValid()` before building your params object.
- Fractional seconds are carried into the millisecond field (`{ seconds: 1.5 }` becomes `{ seconds: 1, milliseconds: 500 }`), which the ISO writer renders as `PT1.5S`.
- Negative durations keep their sign per component, which produces non-standard output such as `PT-1H` - normalize with `.abs()` and send the sign separately if that matters.
- `moment.Duration` values are not instants; never pair `MomentDurationValueFromStrategy` with a date writer such as `IsoDateValueToStrategy` - the converter always runs the paired writer, it does not re-check the shape.
- Moment is in maintenance mode upstream; for new code prefer [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon) or [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs). Both can be registered next to this package during a gradual migration.

---

## 🔗 Related packages

- Outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Other inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

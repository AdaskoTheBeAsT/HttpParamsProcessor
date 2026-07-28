# 📆 @adaskothebeast/http-params-processor-value-from-dayjs

**Day.js input strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): normalize `Dayjs` instants and Day.js `Duration` objects before they are serialized.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-from-dayjs?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `core` and `dayjs` (`^1.11.21`). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-from-dayjs @adaskothebeast/http-params-processor-core dayjs
```

No extra plugin package is needed: the duration strategy pulls `dayjs/plugin/duration` in itself.

---

## 🎯 What it does

These are **value-from** strategies: the first half of the conversion pipeline. Each one normalizes a Day.js type into a neutral shape and must be paired with a **value-to** strategy (`-value-to-iso`, `-value-to-nodatime`, `-value-to-unix-timestamp`, `-value-to-ms-timestamp`, `-value-to-date-fns`) through `createValueConverter`.

| Class                            | Accepts                                     | Produces                                                                                        |
| -------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DayjsDateValueFromStrategy`     | `Dayjs` (detected by `dayjs.isDayjs`)       | `Date` (`value.toDate()`)                                                                       |
| `DayjsDurationValueFromStrategy` | `Duration` (detected by `dayjs.isDuration`) | `DurationComponents` (`years`, `months`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`) |

Detection is exact and mutually exclusive: a `Dayjs` object is never claimed by the duration strategy and vice versa, so both converters can be registered side by side.

---

## ⚡ Usage

```ts
import { DefaultDateValueFromStrategy, ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { DayjsDateValueFromStrategy, DayjsDurationValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-dayjs';
import { IsoDateValueToStrategy, IsoDurationValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-iso';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const processor = new ParamsProcessor({
  valueConverters: [
    createValueConverter(new DayjsDateValueFromStrategy(), new IsoDateValueToStrategy()),
    createValueConverter(new DayjsDurationValueFromStrategy(), new IsoDurationValueToStrategy()),
    // keep native Dates working too
    createValueConverter(new DefaultDateValueFromStrategy(), new IsoDateValueToStrategy()),
  ],
});

processor.process('p', {
  from: dayjs('2024-01-15T10:30:00.000Z'),
  window: dayjs.duration({ hours: 1, minutes: 30, seconds: 45 }),
});
// [['p.from', '2024-01-15T10:30:00.000Z'], ['p.window', 'PT1H30M45S']]
```

---

## 🎛️ Options and configuration

Neither strategy takes constructor options - both are stateless and safe to share between processors.

**The duration plugin.** `DayjsDurationValueFromStrategy` imports `dayjs/plugin/duration` and calls `dayjs.extend(durationPlugin)` at module load, so the plugin is always registered before the strategy runs. Your own code still needs its own `dayjs.extend(duration)` call to create durations: it gives you the `dayjs.duration` typings and makes the call independent of import order.

**Output format** is decided entirely by the paired value-to strategy. `Dayjs` normalizes to a `Date` (an instant), so any date writer works:

```ts
import { UnixTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-unix-timestamp';

createValueConverter(new DayjsDateValueFromStrategy(), new UnixTimestampValueToStrategy());
```

**Registration order** matters only against strategies with overlapping detection. Put these before `DefaultDateValueFromStrategy` if you also register it - `Dayjs` is not a `Date`, so in practice they never compete.

---

## 📤 Output examples

Paired with `-value-to-iso`:

| Value passed to `process`                   | Normalized shape            | Serialized                 |
| ------------------------------------------- | --------------------------- | -------------------------- |
| `dayjs('2024-01-15T10:30:00.000Z')`         | `Date` (instant)            | `2024-01-15T10:30:00.000Z` |
| `dayjs.duration({ hours: 1, minutes: 30 })` | `{ hours: 1, minutes: 30 }` | `PT1H30M`                  |
| `dayjs.duration({ minutes: 90 })`           | `{ minutes: 90 }`           | `PT90M`                    |
| `dayjs.duration(5400000)`                   | `{ hours: 1, minutes: 30 }` | `PT1H30M`                  |
| `dayjs.duration('PT1H30M')`                 | `{ hours: 1, minutes: 30 }` | `PT1H30M`                  |
| `dayjs.duration({ months: 18 })`            | `{ months: 18 }`            | `P18M`                     |
| `dayjs.duration({ days: 5, hours: 2 })`     | `{ days: 5, hours: 2 }`     | `P5DT2H`                   |
| `dayjs.duration({ weeks: 2 })`              | `{}`                        | `PT0S`                     |

```text
p.from    = 2024-01-15T10:30:00.000Z
p.window  = PT1H30M45S
```

---

## ⚠️ Edge cases

- **Weeks are dropped.** Day.js keeps `weeks` in its own slot and reports `days()` as `0` for `dayjs.duration({ weeks: 2 })`, and the strategy maps only `years`, `months`, `days` and the time fields. Such a duration normalizes to an empty object (`PT0S` with the ISO writer) - pass `{ days: 14 }` instead.
- **Object-built durations are not normalized.** `dayjs.duration({ minutes: 90 })` stays `PT90M`; only millisecond and ISO-string inputs are split into hours/minutes/seconds by Day.js itself. Use `dayjs.duration(dur.asMilliseconds())` if you need the carried form.
- Zero components are converted to `undefined`, so `{ hours: 1 }` never emits `0` days or minutes, and `dayjs.duration(0)` normalizes to an empty object.
- **Invalid dates still pass `canHandle`.** `dayjs('not-a-date')` is a `Dayjs` object, so it is claimed and normalized to `Invalid Date`; `IsoDateValueToStrategy` then throws `RangeError: Invalid time value` (timestamp writers emit `NaN`). Filter with `.isValid()` before building your params object.
- Time zone and UTC metadata (from `dayjs/plugin/timezone` or `dayjs/plugin/utc`) is **not** carried over: `toDate()` yields a plain instant, and the paired writer decides the rendering (the ISO writer always emits UTC with `Z`).
- `dayjs.duration()` results are not instants; never pair `DayjsDurationValueFromStrategy` with a date writer such as `IsoDateValueToStrategy` - the converter always runs the paired writer, it does not re-check the shape.
- **Avoid fractional seconds.** Day.js reports them twice: `dayjs.duration({ seconds: 1.5 })` yields `{ seconds: 1.5, milliseconds: 500 }`, and the ISO writer adds the fraction to the milliseconds, producing `PT2S`. Pass `{ seconds: 1, milliseconds: 500 }` instead.

---

## 🔗 Related packages

- Outputs: [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Other inputs: [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

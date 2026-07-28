# 🆔 @adaskothebeast/http-params-processor-value-from-uuid

**UUID input strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): canonical, braced, urn and unhyphenated strings or raw 16 byte arrays, normalized to RFC 4122 bytes.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-from-uuid?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-uuid)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Peer dependencies: `core` + `uuid` (types ship with `uuid`, no companion `@types` package). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-from-uuid @adaskothebeast/http-params-processor-core uuid
```

---

## 🎯 What it does

These are **value-from** strategies: the first half of the conversion pipeline. They normalize a UUID into the neutral `UuidComponents` shape from `core` (`{ bytes: Uint8Array }`, 16 bytes in RFC 4122 order), and a **value-to** strategy from [`-value-to-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-uuid) decides the wire format.

| Class                         | Normalizes                                                 | Produces                       |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------ |
| `UuidStringValueFromStrategy` | `string` (canonical, braced, urn, unhyphenated)            | `UuidComponents` (`{ bytes }`) |
| `UuidBytesValueFromStrategy`  | `Uint8Array` (16 bytes, as returned by `uuid`'s `parse()`) | `UuidComponents` (`{ bytes }`) |

Working at the byte level is what makes the output side interchangeable: the same identifier can be emitted as `550e8400-e29b-41d4-a716-446655440000`, `{550E8400-…}` for a .NET `Guid.Parse` binder, `urn:uuid:…` or a 22 character base64 "short guid", without the caller knowing.

Also exported (type only): `UuidStringValueFromOptions`, `UuidValueFromOptions`, `UuidStringForm`, `UuidVersion`.

---

## ⚡ Usage

```ts
import { ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { UuidBytesValueFromStrategy, UuidStringValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-uuid';
import { CanonicalUuidValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-uuid';
import { parse } from 'uuid';

const processor = new ParamsProcessor({
  valueConverters: [createValueConverter(new UuidBytesValueFromStrategy(), new CanonicalUuidValueToStrategy()), createValueConverter(new UuidStringValueFromStrategy({ forms: ['canonical', 'braced'] }), new CanonicalUuidValueToStrategy())],
});

processor.process('p', {
  id: '{550E8400-E29B-41D4-A716-446655440000}',
  parentId: parse('6ba7b810-9dad-11d1-80b4-00c04fd430c8'),
});
// [['p.id',       '550e8400-e29b-41d4-a716-446655440000'],
//  ['p.parentId', '6ba7b810-9dad-11d1-80b4-00c04fd430c8']]
```

---

## 🎛️ Options and configuration

```ts
type UuidVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type UuidStringForm = 'canonical' | 'braced' | 'urn' | 'unhyphenated';

interface UuidValueFromOptions {
  versions?: readonly UuidVersion[];
  strict?: boolean;
}

interface UuidStringValueFromOptions extends UuidValueFromOptions {
  forms?: readonly UuidStringForm[];
}
```

| Option     | Applies to           | Default         | Effect                                                                                                                                    |
| ---------- | -------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `forms`    | string strategy only | `['canonical']` | Which textual shapes are unwrapped and accepted                                                                                           |
| `versions` | both strategies      | unset           | Allowlist of accepted version nibbles; other versions are declined (or throw in strict mode)                                              |
| `strict`   | both strategies      | `false`         | Claim values of the right _shape_ even when validation fails, so they **throw** instead of silently falling through to the next converter |

Accepted string forms:

| `UuidStringForm` | Example                                         | Note                                                                                                          |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `canonical`      | `550e8400-e29b-41d4-a716-446655440000`          | 36 chars, the default                                                                                         |
| `braced`         | `{550e8400-e29b-41d4-a716-446655440000}`        | 38 chars, .NET "B"                                                                                            |
| `urn`            | `urn:uuid:550e8400-e29b-41d4-a716-446655440000` | 45 chars, prefix match is case insensitive                                                                    |
| `unhyphenated`   | `550e8400e29b41d4a716446655440000`              | 32 chars, .NET "N", opt-in because a bare 32 character hex string is indistinguishable from other identifiers |

```ts
// only v4, and shout when something else shows up
new UuidStringValueFromStrategy({ versions: [4], strict: true });

// accept every textual form
new UuidStringValueFromStrategy({
  forms: ['canonical', 'braced', 'urn', 'unhyphenated'],
});

// bytes, v7 only
new UuidBytesValueFromStrategy({ versions: [7] });
```

---

## 📤 Output examples

`UuidStringValueFromStrategy` with the default options:

| Input                                                        | `canHandle` | `normalizeValue`                       |
| ------------------------------------------------------------ | ----------- | -------------------------------------- |
| `'550e8400-e29b-41d4-a716-446655440000'`                     | `true`      | `{ bytes: parse('550e8400-…') }`       |
| `'550E8400-E29B-41D4-A716-446655440000'`                     | `true`      | same bytes (case is normalized)        |
| `NIL` (`'00000000-0000-0000-0000-000000000000'`)             | `true`      | 16 zero bytes                          |
| `'{550e8400-…}'`, `'urn:uuid:550e8400-…'`, `'550e8400e29b…'` | `false`     | not claimed until the form is opted in |
| `'not-a-uuid'`, `''`, `42`                                   | `false`     | -                                      |

With `forms: ['canonical', 'braced', 'urn', 'unhyphenated']`, all four shapes of the same identifier normalize to identical bytes.

`UuidBytesValueFromStrategy`:

| Input                                      | `canHandle` | `normalizeValue`        |
| ------------------------------------------ | ----------- | ----------------------- |
| `parse('550e8400-…')` (16 bytes)           | `true`      | a **copy** of the bytes |
| `new Uint8Array(15)`, `new Uint8Array(17)` | `false`     | wrong length            |
| `'550e8400-…'`, `null`, `[1, 2, 3]`        | `false`     | not a `Uint8Array`      |

---

## ⚠️ Edge cases

- **Validation errors are exact.** `normalizeValue` throws:

  ```text
  Invalid UUID: 'not-a-uuid'
  Invalid UUID: version 1 is not allowed
  Invalid UUID: expected 16 bytes, received 8
  ```

- **`canHandle` normally declines instead of throwing.** An invalid UUID string simply falls through to the next converter, which is what you want when the same processor also serializes ordinary strings.
- **`strict: true` flips that trade-off.** The string strategy then claims anything with a plausible length for one of the enabled forms (36 / 38 / 45 / 32 characters), so `'550e8400-e29b-91d4-a716-446655440000'` (an invalid version nibble) is claimed and `normalizeValue` throws; `'short'` is still declined. The bytes strategy in strict mode claims **every** `Uint8Array`, including `new Uint8Array(4)`, and then throws on the length check.
- **`versions` filters on the detected version nibble.** Detection goes through `uuid`'s `version()`, and anything it rejects yields `undefined`, which is never allowed. Note that the nil UUID reports version `0`, which is not a member of `UuidVersion`, so a `versions` allowlist always excludes it.
- **Version filtering combined with `strict: true` claims first and validates later**: `canHandle` returns `true` for a valid UUID of a disallowed version so that `normalizeValue` can throw `Invalid UUID: version <n> is not allowed`.
- **Bytes are copied**, never aliased (`new Uint8Array(value)`), so mutating your buffer after `normalizeValue` cannot change the serialized value.
- **Byte order is RFC 4122**, the layout produced by `uuid`'s `parse()`. .NET's `Guid.ToByteArray()` uses a mixed-endian layout, so re-order those bytes yourself before feeding them in.
- **The bytes strategy is more specific than the string one**, but both can be registered - put the byte converter first, since converters are tried in registration order and the first `canHandle` wins.
- **`unhyphenated` is length driven**: with that form enabled, every 32 character string is unwrapped and validated, so enable it only where the values really are UUIDs.

---

## 🔗 Related packages

- Outputs: [`-value-to-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-uuid) (`CanonicalUuidValueToStrategy`, `NoDashUuidValueToStrategy`, `BracedUuidValueToStrategy`, `UrnUuidValueToStrategy`, `Base64UuidValueToStrategy`)
- Other inputs: [`-value-from-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-decimal), [`-value-from-luxon`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-luxon), [`-value-from-dayjs`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-dayjs), [`-value-from-moment`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-moment), [`-value-from-js-joda`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-js-joda)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

# 🔖 @adaskothebeast/http-params-processor-value-to-uuid

**UUID output strategies for [HttpParamsProcessor](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor): canonical, no dash, braced, urn and base64 "short guid" formats.**

[![npm](https://img.shields.io/npm/v/%40adaskothebeast%2Fhttp-params-processor-value-to-uuid?color=cb3837&logo=npm)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-uuid)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

No runtime dependency beyond `core` (hex and base64 are computed in-package, `uuid` is **not** needed). ESM + CJS. `sideEffects: false`.

---

## 📦 Install

```bash
npm i @adaskothebeast/http-params-processor-value-to-uuid @adaskothebeast/http-params-processor-core
```

---

## 🎯 What it does

These are **value-to** strategies: the second half of the conversion pipeline. Each one consumes the neutral `UuidComponents` shape from `core` (`{ bytes: Uint8Array }`, 16 bytes in RFC 4122 order) - normally produced by [`-value-from-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-uuid) - and renders it as a query string value.

| Class                          | Format                  | Example output                                  |
| ------------------------------ | ----------------------- | ----------------------------------------------- |
| `CanonicalUuidValueToStrategy` | hyphenated, .NET "D"    | `550e8400-e29b-41d4-a716-446655440000`          |
| `NoDashUuidValueToStrategy`    | 32 hex digits, .NET "N" | `550e8400e29b41d4a716446655440000`              |
| `BracedUuidValueToStrategy`    | braces, .NET "B"        | `{550e8400-e29b-41d4-a716-446655440000}`        |
| `UrnUuidValueToStrategy`       | RFC 4122 URN            | `urn:uuid:550e8400-e29b-41d4-a716-446655440000` |
| `Base64UuidValueToStrategy`    | base64 encoded bytes    | `VQ6EAOKbQdSnFkRmVUQAAA`                        |

Byte level formatting is the point: a .NET minimal API that binds `Guid` accepts "D", "N", "B" and "P" shapes, Java's `UUID.fromString` insists on the canonical form, and shortened base64 identifiers keep URLs small. Same identifier, one converter swap.

Also exported: `UuidValueToStrategyBase` (extend it for a custom hex layout) plus the option types `UuidValueToOptions` and `Base64UuidValueToOptions`.

---

## ⚡ Usage

```ts
import { ParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-core';
import { UuidStringValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-uuid';
import { BracedUuidValueToStrategy, CanonicalUuidValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-uuid';

const processor = new ParamsProcessor({
  valueConverters: [createValueConverter(new UuidStringValueFromStrategy(), new CanonicalUuidValueToStrategy())],
});

processor.process('p', { id: '550E8400-E29B-41D4-A716-446655440000' });
// [['p.id', '550e8400-e29b-41d4-a716-446655440000']]

// a backend that wants the .NET "B" format in upper case
const dotnet = new ParamsProcessor({
  valueConverters: [createValueConverter(new UuidStringValueFromStrategy(), new BracedUuidValueToStrategy({ uppercase: true }))],
});

dotnet.process('p', { id: '550e8400-e29b-41d4-a716-446655440000' });
// [['p.id', '{550E8400-E29B-41D4-A716-446655440000}']]
```

---

## 🎛️ Options and configuration

```ts
interface UuidValueToOptions {
  uppercase?: boolean; // defaults to false
}

interface Base64UuidValueToOptions {
  urlSafe?: boolean; // defaults to true  (`-` and `_` instead of `+` and `/`)
  padding?: boolean; // defaults to false (22 characters, no `=`)
}
```

| Class                          | Constructor                                  | Options                    |
| ------------------------------ | -------------------------------------------- | -------------------------- |
| `CanonicalUuidValueToStrategy` | `new CanonicalUuidValueToStrategy(options?)` | `UuidValueToOptions`       |
| `NoDashUuidValueToStrategy`    | `new NoDashUuidValueToStrategy(options?)`    | `UuidValueToOptions`       |
| `BracedUuidValueToStrategy`    | `new BracedUuidValueToStrategy(options?)`    | `UuidValueToOptions`       |
| `UrnUuidValueToStrategy`       | `new UrnUuidValueToStrategy()`               | none, always lower case    |
| `Base64UuidValueToStrategy`    | `new Base64UuidValueToStrategy(options?)`    | `Base64UuidValueToOptions` |

`uppercase: true` upper cases the whole rendered string, which is why `UrnUuidValueToStrategy` does not expose it: the `urn:uuid:` prefix has to stay lower case. `Base64UuidValueToStrategy` has no `uppercase` option either - base64 is case sensitive.

All five strategies share the same `canHandle`, a structural guard over `UuidComponents`: an object whose `bytes` property is a `Uint8Array` of exactly 16 bytes.

| `canHandle` input                        | Result  |
| ---------------------------------------- | ------- |
| `{ bytes: <16 byte Uint8Array> }`        | `true`  |
| `{ bytes: new Uint8Array(4) }`           | `false` |
| a bare `Uint8Array`                      | `false` |
| `'550e8400-e29b-41d4-a716-446655440000'` | `false` |
| `null`                                   | `false` |

### Custom formats

```ts
import { UuidValueToOptions, UuidValueToStrategyBase } from '@adaskothebeast/http-params-processor-value-to-uuid';

class ParenUuidValueToStrategy extends UuidValueToStrategyBase {
  constructor(options: UuidValueToOptions = {}) {
    super(options);
  }

  protected override format(bytes: Uint8Array): string {
    return `(${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')})`;
  }
}
```

The base class implements `canHandle` and the `uppercase` handling; you only supply `format`.

---

## 📤 Output examples

All rows use the same bytes, `[0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x41, 0xd4, 0xa7, 0x16, 0x44, 0x66, 0x55, 0x44, 0x00, 0x00]`:

| Strategy                                                           | Output                                          |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| `new CanonicalUuidValueToStrategy()`                               | `550e8400-e29b-41d4-a716-446655440000`          |
| `new CanonicalUuidValueToStrategy({ uppercase: true })`            | `550E8400-E29B-41D4-A716-446655440000`          |
| `new NoDashUuidValueToStrategy()`                                  | `550e8400e29b41d4a716446655440000`              |
| `new BracedUuidValueToStrategy()`                                  | `{550e8400-e29b-41d4-a716-446655440000}`        |
| `new UrnUuidValueToStrategy()`                                     | `urn:uuid:550e8400-e29b-41d4-a716-446655440000` |
| `new Base64UuidValueToStrategy()`                                  | `VQ6EAOKbQdSnFkRmVUQAAA`                        |
| `new Base64UuidValueToStrategy({ urlSafe: false, padding: true })` | `VQ6EAOKbQdSnFkRmVUQAAA==`                      |

The url-safe alphabet only shows up when the bytes need it. For `fffefd00-0102-7f80-8110-203040506070`:

```text
new Base64UuidValueToStrategy()                                    -> __79AAECf4CBECAwQFBgcA
new Base64UuidValueToStrategy({ urlSafe: false, padding: true })   -> //79AAECf4CBECAwQFBgcA==
new Base64UuidValueToStrategy({ urlSafe: false })                  -> //79AAECf4CBECAwQFBgcA
```

Leading zero bytes are always padded, so 16 zero bytes render as `00000000-0000-0000-0000-000000000000`, not a shortened literal.

---

## ⚠️ Edge cases

- **`canHandle` is length strict.** `{ bytes: new Uint8Array(4) }` is declined rather than rendered as a short hex string, so a malformed intermediate value falls through to the next converter instead of producing an invalid identifier.
- **A bare `Uint8Array` is not claimed**, only the wrapped `{ bytes }` shape. Register [`UuidBytesValueFromStrategy`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-uuid) as the _from_ half to get there.
- **Base64 output is 22 characters by default.** 16 bytes are not a multiple of 3, so the final group encodes a single byte: with `padding: true` it is followed by `==` (24 characters total), and without padding those two characters are simply omitted.
- **`urlSafe` defaults to `true`** and only switches to the standard alphabet when you pass `urlSafe: false` explicitly (any other value keeps `-`/`_`). Url-safe output needs no percent-encoding in a query string, while `+` and `/` from the standard alphabet do.
- **Base64 encodes RFC 4122 byte order**, which differs from the mixed-endian layout of .NET `Guid.ToByteArray()`. A .NET service that does `new Guid(bytes)` on the decoded value will see a different UUID unless it re-orders the first three fields.
- **Nothing is validated beyond the byte count.** Version and variant nibbles are irrelevant here, so the nil UUID, the max UUID and non-RFC byte patterns all serialize happily - enforce versions on the _from_ side with the `versions` option.
- **All five strategies accept exactly the same input shape**, and converters are tried in registration order with the first matching `canHandle` winning. Register at most one UUID converter per processor, or use separate processors when different endpoints need different formats.
- `uppercase` affects the entire rendered string, so it upper cases the plain hex of `NoDashUuidValueToStrategy` and the hex inside the braces of `BracedUuidValueToStrategy` (the braces have no case of their own).

---

## 🔗 Related packages

- Inputs: [`-value-from-uuid`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-from-uuid) (`UuidStringValueFromStrategy`, `UuidBytesValueFromStrategy`)
- Other outputs: [`-value-to-decimal`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-decimal), [`-value-to-iso`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-iso), [`-value-to-nodatime`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-nodatime), [`-value-to-unix-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-unix-timestamp), [`-value-to-ms-timestamp`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-ms-timestamp), [`-value-to-date-fns`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-value-to-date-fns)
- Engine: [`-core`](https://www.npmjs.com/package/@adaskothebeast/http-params-processor-core)

Full matrix and adapter recipes: [main README](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor#readme).

---

## 📄 License

[MIT](./LICENSE) © Adam Pluciński

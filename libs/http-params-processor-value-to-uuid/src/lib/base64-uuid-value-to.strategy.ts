import {
  IValueToStrategy,
  UuidComponents,
} from '@adaskothebeast/http-params-processor-core';

import { isUuidComponents } from './uuid-components.guard';

/**
 * Options for base64 UUID serialization.
 */
export interface Base64UuidValueToOptions {
  /**
   * Use the URL and filename safe alphabet (`-` and `_`). Defaults to true.
   */
  urlSafe?: boolean;

  /**
   * Emit `=` padding. Defaults to false, which yields 22 characters.
   */
  padding?: boolean;
}

const standardAlphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const urlSafeAlphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * Serializes UUIDs as base64 encoded bytes ("short guid" style).
 * The bytes are encoded in RFC 4122 order, which differs from the mixed-endian
 * layout of .NET `Guid.ToByteArray()`.
 */
export class Base64UuidValueToStrategy implements IValueToStrategy<UuidComponents> {
  private readonly alphabet: string;
  private readonly padding: boolean;

  constructor(options: Base64UuidValueToOptions = {}) {
    this.alphabet =
      options.urlSafe === false ? standardAlphabet : urlSafeAlphabet;
    this.padding = options.padding === true;
  }

  serializeValue(value: UuidComponents): string {
    const bytes = value.bytes;
    let result = '';

    for (let index = 0; index < bytes.length; index += 3) {
      const byte0 = bytes[index];
      const byte1 = bytes[index + 1];
      const byte2 = bytes[index + 2];

      result += this.alphabet[byte0 >> 2];
      result +=
        this.alphabet[((byte0 & 0b11) << 4) | (byte1 === undefined ? 0 : byte1 >> 4)];

      if (byte1 === undefined) {
        result += this.padding ? '==' : '';
        break;
      }

      result +=
        this.alphabet[
          ((byte1 & 0b1111) << 2) | (byte2 === undefined ? 0 : byte2 >> 6)
        ];

      if (byte2 === undefined) {
        result += this.padding ? '=' : '';
        break;
      }

      result += this.alphabet[byte2 & 0b111111];
    }

    return result;
  }

  canHandle(value: unknown): value is UuidComponents {
    return isUuidComponents(value);
  }
}

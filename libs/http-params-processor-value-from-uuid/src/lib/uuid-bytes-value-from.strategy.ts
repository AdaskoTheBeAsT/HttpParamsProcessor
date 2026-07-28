import {
  IValueFromStrategy,
  UuidComponents,
} from '@adaskothebeast/http-params-processor-core';

import { UuidValueFromOptions } from './uuid-value-from.options';
import { isVersionAllowed, versionOfBytes } from './uuid-version.util';

const uuidByteLength = 16;

/**
 * Normalizes a 16 byte Uint8Array (RFC 4122 byte order) into UuidComponents.
 * This is the representation produced by `uuid`'s `parse()`.
 */
export class UuidBytesValueFromStrategy implements IValueFromStrategy<
  Uint8Array,
  UuidComponents
> {
  constructor(private readonly options: UuidValueFromOptions = {}) {}

  normalizeValue(value: Uint8Array): UuidComponents {
    if (value.byteLength !== uuidByteLength) {
      throw new Error(
        `Invalid UUID: expected ${uuidByteLength} bytes, received ${value.byteLength}`,
      );
    }

    const bytes = new Uint8Array(value);
    const versions = this.options.versions;
    if (versions && !isVersionAllowed(versionOfBytes(bytes), versions)) {
      throw new Error(
        `Invalid UUID: version ${versionOfBytes(bytes)} is not allowed`,
      );
    }

    return { bytes };
  }

  canHandle(value: unknown): value is Uint8Array {
    if (!(value instanceof Uint8Array)) {
      return false;
    }

    if (this.options.strict) {
      return true;
    }

    if (value.byteLength !== uuidByteLength) {
      return false;
    }

    const versions = this.options.versions;
    return !versions || isVersionAllowed(versionOfBytes(value), versions);
  }
}

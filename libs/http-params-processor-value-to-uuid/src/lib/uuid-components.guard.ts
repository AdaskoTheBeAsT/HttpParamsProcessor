import { UuidComponents } from '@adaskothebeast/http-params-processor-core';

const uuidByteLength = 16;

/**
 * Structural type guard for the UuidComponents intermediate type.
 */
export function isUuidComponents(value: unknown): value is UuidComponents {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const bytes = (value as UuidComponents).bytes;
  return bytes instanceof Uint8Array && bytes.byteLength === uuidByteLength;
}

/**
 * Represents a UUID as its 16 raw bytes in RFC 4122 (big-endian) order.
 * Used as an intermediate type between UUID inputs and UUID string formats.
 */
export interface UuidComponents {
  bytes: Uint8Array;
}

/**
 * Number of bytes in a UUID.
 */
export const UUID_BYTE_LENGTH = 16;

/**
 * Type guard for the UuidComponents intermediate type.
 */
export function isUuidComponents(value: unknown): value is UuidComponents {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const bytes = (value as UuidComponents).bytes;
  return bytes instanceof Uint8Array && bytes.byteLength === UUID_BYTE_LENGTH;
}

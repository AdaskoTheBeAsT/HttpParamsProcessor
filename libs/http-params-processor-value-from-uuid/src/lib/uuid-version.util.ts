import { stringify, version as uuidVersion } from 'uuid';

import { UuidVersion } from './uuid-value-from.options';

/**
 * Reads the version nibble of a UUID string, or undefined when it is not a
 * valid RFC 4122 UUID.
 */
export function versionOfString(value: string): number | undefined {
  try {
    return uuidVersion(value);
  } catch {
    return undefined;
  }
}

/**
 * Reads the version nibble of 16 UUID bytes, or undefined when the bytes do not
 * form a valid RFC 4122 UUID.
 */
export function versionOfBytes(bytes: Uint8Array): number | undefined {
  try {
    return uuidVersion(stringify(bytes));
  } catch {
    return undefined;
  }
}

/**
 * Checks a detected version against an allowlist.
 */
export function isVersionAllowed(
  version: number | undefined,
  versions: readonly UuidVersion[],
): boolean {
  return (
    version !== undefined && versions.some((allowed) => allowed === version)
  );
}

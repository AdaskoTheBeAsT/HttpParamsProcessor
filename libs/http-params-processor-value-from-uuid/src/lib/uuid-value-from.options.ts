/**
 * UUID versions defined by RFC 4122 / RFC 9562.
 */
export type UuidVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Textual UUID forms that can be accepted as input.
 *
 * - `canonical` – `550e8400-e29b-41d4-a716-446655440000`
 * - `braced` – `{550e8400-e29b-41d4-a716-446655440000}` (.NET "B" format)
 * - `urn` – `urn:uuid:550e8400-e29b-41d4-a716-446655440000`
 * - `unhyphenated` – `550e8400e29b41d4a716446655440000` (.NET "N" format)
 */
export type UuidStringForm = 'canonical' | 'braced' | 'urn' | 'unhyphenated';

/**
 * Shared options for UUID value-from strategies.
 */
export interface UuidValueFromOptions {
  /**
   * When set, only UUIDs of the listed versions are accepted.
   */
  versions?: readonly UuidVersion[];

  /**
   * When true, values of the recognized shape that fail validation throw
   * instead of being left for the next converter.
   */
  strict?: boolean;
}

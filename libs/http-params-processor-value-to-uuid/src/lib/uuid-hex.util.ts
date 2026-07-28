const hexPairs: string[] = Array.from({ length: 256 }, (_, index) =>
  index.toString(16).padStart(2, '0'),
);

/**
 * Renders UUID bytes as canonical hyphenated lowercase hex.
 */
export function toCanonicalHex(bytes: Uint8Array): string {
  const hex = toHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Renders UUID bytes as 32 lowercase hex characters.
 */
export function toHex(bytes: Uint8Array): string {
  let result = '';
  for (const byte of bytes) {
    result += hexPairs[byte];
  }
  return result;
}

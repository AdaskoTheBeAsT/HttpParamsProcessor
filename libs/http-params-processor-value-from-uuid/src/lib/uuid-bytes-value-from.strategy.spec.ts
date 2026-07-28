import { NIL, parse } from 'uuid';

import { UuidBytesValueFromStrategy } from './uuid-bytes-value-from.strategy';

const uuidV1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const uuidV4 = '550e8400-e29b-41d4-a716-446655440000';

describe('UuidBytesValueFromStrategy', () => {
  const strategy = new UuidBytesValueFromStrategy();

  describe('canHandle', () => {
    it('should handle 16 byte arrays', () => {
      expect(strategy.canHandle(parse(uuidV4))).toBe(true);
      expect(strategy.canHandle(parse(uuidV1))).toBe(true);
      expect(strategy.canHandle(parse(NIL))).toBe(true);
    });

    it('should not handle arrays of other lengths', () => {
      expect(strategy.canHandle(new Uint8Array(15))).toBe(false);
      expect(strategy.canHandle(new Uint8Array(17))).toBe(false);
    });

    it('should not handle other values', () => {
      expect(strategy.canHandle(uuidV4)).toBe(false);
      expect(strategy.canHandle(null)).toBe(false);
      expect(strategy.canHandle([1, 2, 3])).toBe(false);
    });

    it('should respect a version allowlist', () => {
      const v4Only = new UuidBytesValueFromStrategy({ versions: [4] });

      expect(v4Only.canHandle(parse(uuidV4))).toBe(true);
      expect(v4Only.canHandle(parse(uuidV1))).toBe(false);
    });

    it('should handle any byte array in strict mode', () => {
      const strict = new UuidBytesValueFromStrategy({ strict: true });

      expect(strict.canHandle(new Uint8Array(4))).toBe(true);
    });
  });

  describe('normalizeValue', () => {
    it('should copy the bytes', () => {
      const bytes = parse(uuidV4);
      const result = strategy.normalizeValue(bytes);

      expect(result.bytes).toEqual(bytes);
      expect(result.bytes).not.toBe(bytes);
    });

    it('should throw on a wrong byte length', () => {
      expect(() => strategy.normalizeValue(new Uint8Array(8))).toThrow(
        'Invalid UUID: expected 16 bytes, received 8',
      );
    });

    it('should throw on a disallowed version', () => {
      const v4Only = new UuidBytesValueFromStrategy({ versions: [4] });

      expect(() => v4Only.normalizeValue(parse(uuidV1))).toThrow(
        'Invalid UUID: version 1 is not allowed',
      );
    });
  });
});

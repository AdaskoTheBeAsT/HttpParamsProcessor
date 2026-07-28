import { NIL, parse } from 'uuid';

import { UuidStringValueFromStrategy } from './uuid-string-value-from.strategy';

const uuidV1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const uuidV4 = '550e8400-e29b-41d4-a716-446655440000';

describe('UuidStringValueFromStrategy', () => {
  const strategy = new UuidStringValueFromStrategy();

  describe('canHandle', () => {
    it('should handle canonical uuids', () => {
      expect(strategy.canHandle(uuidV4)).toBe(true);
      expect(strategy.canHandle(uuidV1)).toBe(true);
      expect(strategy.canHandle(NIL)).toBe(true);
    });

    it('should handle upper case canonical uuids', () => {
      expect(strategy.canHandle(uuidV4.toUpperCase())).toBe(true);
    });

    it('should not handle invalid or non canonical strings', () => {
      expect(strategy.canHandle('')).toBe(false);
      expect(strategy.canHandle('not-a-uuid')).toBe(false);
      expect(strategy.canHandle('550e8400e29b41d4a716446655440000')).toBe(
        false,
      );
      expect(strategy.canHandle(`{${uuidV4}}`)).toBe(false);
      expect(strategy.canHandle(`urn:uuid:${uuidV4}`)).toBe(false);
      expect(strategy.canHandle(42)).toBe(false);
    });

    it('should handle opted-in forms', () => {
      const anyForm = new UuidStringValueFromStrategy({
        forms: ['canonical', 'braced', 'urn', 'unhyphenated'],
      });

      expect(anyForm.canHandle(`{${uuidV4}}`)).toBe(true);
      expect(anyForm.canHandle(`urn:uuid:${uuidV4}`)).toBe(true);
      expect(anyForm.canHandle('550e8400e29b41d4a716446655440000')).toBe(true);
    });

    it('should respect a version allowlist', () => {
      const v4Only = new UuidStringValueFromStrategy({ versions: [4] });

      expect(v4Only.canHandle(uuidV4)).toBe(true);
      expect(v4Only.canHandle(uuidV1)).toBe(false);
    });

    it('should claim uuid shaped strings in strict mode', () => {
      const strict = new UuidStringValueFromStrategy({ strict: true });

      expect(strict.canHandle('550e8400-e29b-91d4-a716-446655440000')).toBe(
        true,
      );
      expect(strict.canHandle('short')).toBe(false);
    });
  });

  describe('normalizeValue', () => {
    it('should convert canonical uuids to bytes', () => {
      expect(strategy.normalizeValue(uuidV4)).toEqual({
        bytes: parse(uuidV4),
      });
    });

    it('should normalize case', () => {
      expect(strategy.normalizeValue(uuidV4.toUpperCase())).toEqual({
        bytes: parse(uuidV4),
      });
    });

    it('should unwrap braced, urn and unhyphenated forms', () => {
      const anyForm = new UuidStringValueFromStrategy({
        forms: ['canonical', 'braced', 'urn', 'unhyphenated'],
      });
      const expected = { bytes: parse(uuidV4) };

      expect(anyForm.normalizeValue(`{${uuidV4}}`)).toEqual(expected);
      expect(anyForm.normalizeValue(`urn:uuid:${uuidV4}`)).toEqual(expected);
      expect(anyForm.normalizeValue(uuidV4.replaceAll('-', ''))).toEqual(
        expected,
      );
    });

    it('should throw on invalid input', () => {
      expect(() => strategy.normalizeValue('not-a-uuid')).toThrow(
        "Invalid UUID: 'not-a-uuid'",
      );
    });

    it('should throw on a disallowed version', () => {
      const v4Only = new UuidStringValueFromStrategy({ versions: [4] });

      expect(() => v4Only.normalizeValue(uuidV1)).toThrow(
        'Invalid UUID: version 1 is not allowed',
      );
    });
  });
});

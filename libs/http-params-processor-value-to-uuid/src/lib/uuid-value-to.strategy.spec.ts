import { BracedUuidValueToStrategy } from './braced-uuid-value-to.strategy';
import { CanonicalUuidValueToStrategy } from './canonical-uuid-value-to.strategy';
import { NoDashUuidValueToStrategy } from './no-dash-uuid-value-to.strategy';
import { UrnUuidValueToStrategy } from './urn-uuid-value-to.strategy';

const uuid = '550e8400-e29b-41d4-a716-446655440000';
const bytes = new Uint8Array([
  0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x41, 0xd4, 0xa7, 0x16, 0x44, 0x66, 0x55,
  0x44, 0x00, 0x00,
]);
const components = { bytes };

describe('UUID value-to strategies', () => {
  describe('CanonicalUuidValueToStrategy', () => {
    it('should serialize to the canonical form', () => {
      expect(new CanonicalUuidValueToStrategy().serializeValue(components)).toBe(
        uuid,
      );
    });

    it('should support upper case output', () => {
      expect(
        new CanonicalUuidValueToStrategy({ uppercase: true }).serializeValue(
          components,
        ),
      ).toBe(uuid.toUpperCase());
    });

    it('should pad leading zero bytes', () => {
      expect(
        new CanonicalUuidValueToStrategy().serializeValue({
          bytes: new Uint8Array(16),
        }),
      ).toBe('00000000-0000-0000-0000-000000000000');
    });

    it('should handle only UuidComponents', () => {
      const strategy = new CanonicalUuidValueToStrategy();

      expect(strategy.canHandle(components)).toBe(true);
      expect(strategy.canHandle({ bytes: new Uint8Array(4) })).toBe(false);
      expect(strategy.canHandle(bytes)).toBe(false);
      expect(strategy.canHandle(uuid)).toBe(false);
      expect(strategy.canHandle(null)).toBe(false);
    });
  });

  describe('NoDashUuidValueToStrategy', () => {
    it('should serialize without separators', () => {
      expect(new NoDashUuidValueToStrategy().serializeValue(components)).toBe(
        '550e8400e29b41d4a716446655440000',
      );
    });
  });

  describe('BracedUuidValueToStrategy', () => {
    it('should serialize wrapped in braces', () => {
      expect(new BracedUuidValueToStrategy().serializeValue(components)).toBe(
        `{${uuid}}`,
      );
    });
  });

  describe('UrnUuidValueToStrategy', () => {
    it('should serialize as a urn', () => {
      expect(new UrnUuidValueToStrategy().serializeValue(components)).toBe(
        `urn:uuid:${uuid}`,
      );
    });
  });
});

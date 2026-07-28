import { Base64UuidValueToStrategy } from './base64-uuid-value-to.strategy';

const bytes = new Uint8Array([
  0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x41, 0xd4, 0xa7, 0x16, 0x44, 0x66, 0x55,
  0x44, 0x00, 0x00,
]);
const components = { bytes };
const standard = Buffer.from(bytes).toString('base64');

describe('Base64UuidValueToStrategy', () => {
  it('should encode url-safe without padding by default', () => {
    const expected = standard
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '');

    const result = new Base64UuidValueToStrategy().serializeValue(components);

    expect(result).toBe(expected);
    expect(result).toHaveLength(22);
  });

  it('should encode with the standard alphabet when requested', () => {
    expect(
      new Base64UuidValueToStrategy({
        urlSafe: false,
        padding: true,
      }).serializeValue(components),
    ).toBe(standard);
  });

  it('should omit padding but keep the standard alphabet', () => {
    expect(
      new Base64UuidValueToStrategy({ urlSafe: false }).serializeValue(
        components,
      ),
    ).toBe(standard.replaceAll('=', ''));
  });

  it('should encode bytes that exercise the full alphabet', () => {
    const allBytes = new Uint8Array([
      0xff, 0xfe, 0xfd, 0x00, 0x01, 0x02, 0x7f, 0x80, 0x81, 0x10, 0x20, 0x30,
      0x40, 0x50, 0x60, 0x70,
    ]);

    expect(
      new Base64UuidValueToStrategy({
        urlSafe: false,
        padding: true,
      }).serializeValue({ bytes: allBytes }),
    ).toBe(Buffer.from(allBytes).toString('base64'));
  });

  it('should handle only UuidComponents', () => {
    const strategy = new Base64UuidValueToStrategy();

    expect(strategy.canHandle(components)).toBe(true);
    expect(strategy.canHandle({ bytes: new Uint8Array(2) })).toBe(false);
    expect(strategy.canHandle('550e8400-e29b-41d4-a716-446655440000')).toBe(
      false,
    );
  });
});

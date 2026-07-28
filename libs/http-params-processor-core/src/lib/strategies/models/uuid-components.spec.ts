import { UUID_BYTE_LENGTH, isUuidComponents } from './uuid-components';

describe('isUuidComponents', () => {
  it('should accept 16 bytes', () => {
    expect(
      isUuidComponents({ bytes: new Uint8Array(UUID_BYTE_LENGTH) }),
    ).toBe(true);
  });

  it('should reject other byte lengths', () => {
    expect(isUuidComponents({ bytes: new Uint8Array(15) })).toBe(false);
  });

  it('should reject other shapes', () => {
    expect(isUuidComponents(new Uint8Array(UUID_BYTE_LENGTH))).toBe(false);
    expect(isUuidComponents({ bytes: '550e8400' })).toBe(false);
    expect(isUuidComponents(null)).toBe(false);
    expect(isUuidComponents('550e8400-e29b-41d4-a716-446655440000')).toBe(
      false,
    );
  });
});

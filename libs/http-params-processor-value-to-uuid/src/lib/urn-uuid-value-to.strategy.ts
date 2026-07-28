import { toCanonicalHex } from './uuid-hex.util';
import { UuidValueToStrategyBase } from './uuid-value-to.strategy.base';

/**
 * Serializes UUIDs as an RFC 4122 URN.
 * Example: `urn:uuid:550e8400-e29b-41d4-a716-446655440000`
 */
export class UrnUuidValueToStrategy extends UuidValueToStrategyBase {
  constructor() {
    super({});
  }

  protected override format(bytes: Uint8Array): string {
    return `urn:uuid:${toCanonicalHex(bytes)}`;
  }
}

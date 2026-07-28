import { toCanonicalHex } from './uuid-hex.util';
import {
  UuidValueToOptions,
  UuidValueToStrategyBase,
} from './uuid-value-to.strategy.base';

/**
 * Serializes UUIDs in the canonical hyphenated form (.NET "D" format).
 * Example: `550e8400-e29b-41d4-a716-446655440000`
 */
export class CanonicalUuidValueToStrategy extends UuidValueToStrategyBase {
  constructor(options: UuidValueToOptions = {}) {
    super(options);
  }

  protected override format(bytes: Uint8Array): string {
    return toCanonicalHex(bytes);
  }
}

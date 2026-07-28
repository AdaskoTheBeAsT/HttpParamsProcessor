import { toHex } from './uuid-hex.util';
import {
  UuidValueToOptions,
  UuidValueToStrategyBase,
} from './uuid-value-to.strategy.base';

/**
 * Serializes UUIDs as 32 hex digits without separators (.NET "N" format).
 * Example: `550e8400e29b41d4a716446655440000`
 */
export class NoDashUuidValueToStrategy extends UuidValueToStrategyBase {
  constructor(options: UuidValueToOptions = {}) {
    super(options);
  }

  protected override format(bytes: Uint8Array): string {
    return toHex(bytes);
  }
}

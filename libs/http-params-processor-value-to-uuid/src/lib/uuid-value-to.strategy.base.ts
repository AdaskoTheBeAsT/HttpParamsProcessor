import {
  IValueToStrategy,
  UuidComponents,
} from '@adaskothebeast/http-params-processor-core';

import { isUuidComponents } from './uuid-components.guard';

/**
 * Options shared by hex based UUID value-to strategies.
 */
export interface UuidValueToOptions {
  /**
   * Emit upper case hex digits (accepted by .NET `Guid.Parse`).
   */
  uppercase?: boolean;
}

/**
 * Base class handling the UuidComponents type guard and letter casing.
 */
export abstract class UuidValueToStrategyBase implements IValueToStrategy<UuidComponents> {
  protected constructor(protected readonly options: UuidValueToOptions = {}) {}

  serializeValue(value: UuidComponents): string {
    const text = this.format(value.bytes);
    return this.options.uppercase ? text.toUpperCase() : text;
  }

  canHandle(value: unknown): value is UuidComponents {
    return isUuidComponents(value);
  }

  protected abstract format(bytes: Uint8Array): string;
}

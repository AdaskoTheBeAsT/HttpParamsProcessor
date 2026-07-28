import {
  IValueFromStrategy,
  UuidComponents,
} from '@adaskothebeast/http-params-processor-core';
import { parse, validate } from 'uuid';

import {
  UuidStringForm,
  UuidValueFromOptions,
} from './uuid-value-from.options';
import { isVersionAllowed, versionOfString } from './uuid-version.util';

/**
 * Options for the UUID string value-from strategy.
 */
export interface UuidStringValueFromOptions extends UuidValueFromOptions {
  /**
   * Textual forms accepted as input. Defaults to `['canonical']`.
   * `unhyphenated` is opt-in because a bare 32 character hex string is
   * indistinguishable from other identifiers.
   */
  forms?: readonly UuidStringForm[];
}

const canonicalLength = 36;
const unhyphenatedLength = 32;
const urnPrefix = 'urn:uuid:';

/**
 * Normalizes UUID strings into UuidComponents.
 * Canonical, braced, urn and unhyphenated forms are supported; the emitted
 * format is decided by the paired value-to strategy.
 */
export class UuidStringValueFromStrategy implements IValueFromStrategy<
  string,
  UuidComponents
> {
  private readonly forms: readonly UuidStringForm[];

  constructor(private readonly options: UuidStringValueFromOptions = {}) {
    this.forms = options.forms ?? ['canonical'];
  }

  normalizeValue(value: string): UuidComponents {
    const canonical = this.toCanonical(value);
    if (canonical === undefined) {
      throw new Error(`Invalid UUID: '${value}'`);
    }

    const versions = this.options.versions;
    if (versions && !isVersionAllowed(versionOfString(canonical), versions)) {
      throw new Error(
        `Invalid UUID: version ${versionOfString(canonical)} is not allowed`,
      );
    }

    return { bytes: parse(canonical) };
  }

  canHandle(value: unknown): value is string {
    if (typeof value !== 'string') {
      return false;
    }

    const canonical = this.toCanonical(value);
    if (canonical === undefined) {
      return this.options.strict === true && this.hasUuidShape(value);
    }

    const versions = this.options.versions;
    if (!versions) {
      return true;
    }

    return (
      this.options.strict === true ||
      isVersionAllowed(versionOfString(canonical), versions)
    );
  }

  private hasUuidShape(value: string): boolean {
    return (
      (this.forms.includes('canonical') && value.length === canonicalLength) ||
      (this.forms.includes('braced') && value.length === canonicalLength + 2) ||
      (this.forms.includes('urn') &&
        value.length === urnPrefix.length + canonicalLength) ||
      (this.forms.includes('unhyphenated') &&
        value.length === unhyphenatedLength)
    );
  }

  private toCanonical(value: string): string | undefined {
    const unwrapped = this.unwrap(value);
    if (unwrapped === undefined) {
      return undefined;
    }
    return validate(unwrapped) ? unwrapped.toLowerCase() : undefined;
  }

  private unwrap(value: string): string | undefined {
    if (
      this.forms.includes('braced') &&
      value.startsWith('{') &&
      value.endsWith('}')
    ) {
      return value.slice(1, -1);
    }

    if (
      this.forms.includes('urn') &&
      value.toLowerCase().startsWith(urnPrefix)
    ) {
      return value.slice(urnPrefix.length);
    }

    if (
      this.forms.includes('unhyphenated') &&
      value.length === unhyphenatedLength
    ) {
      return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
    }

    return this.forms.includes('canonical') ? value : undefined;
  }
}

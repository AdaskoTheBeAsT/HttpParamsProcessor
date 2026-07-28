import { DecimalComponents } from '@adaskothebeast/http-params-processor-core';

const plainDecimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

/**
 * Structural type guard for the DecimalComponents intermediate type.
 */
export function isDecimalComponents(value: unknown): value is DecimalComponents {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const decimal = (value as DecimalComponents).decimal;
  return typeof decimal === 'string' && plainDecimalPattern.test(decimal);
}

/**
 * Represents an arbitrary precision decimal number.
 * `decimal` holds a lossless, non-exponential decimal literal (e.g. '-1234.5678'),
 * so no precision is lost between the value-from and value-to stages.
 */
export interface DecimalComponents {
  decimal: string;
}

const plainDecimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

/**
 * Type guard for the DecimalComponents intermediate type.
 */
export function isDecimalComponents(value: unknown): value is DecimalComponents {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const decimal = (value as DecimalComponents).decimal;
  return typeof decimal === 'string' && plainDecimalPattern.test(decimal);
}

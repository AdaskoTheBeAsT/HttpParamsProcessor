/**
 * Represents the components of a period (calendar-based).
 * Used as an intermediate type for converting library-specific period types.
 * Unlike Duration, periods cannot be converted to milliseconds because
 * months and years have variable lengths.
 */
export interface PeriodComponents {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
}

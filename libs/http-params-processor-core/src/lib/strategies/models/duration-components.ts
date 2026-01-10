/**
 * Represents the components of a duration (time-based).
 * Used as an intermediate type for converting library-specific duration types.
 */
export interface DurationComponents {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

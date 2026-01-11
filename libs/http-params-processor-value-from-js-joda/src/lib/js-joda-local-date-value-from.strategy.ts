import { IValueFromStrategy } from '@adaskothebeast/http-params-processor-core';
import {
  LocalDate,
  LocalDateTime,
  ZonedDateTime,
  convert,
} from '@js-joda/core';

type JsJodaDateType = LocalDate | LocalDateTime | ZonedDateTime;

/**
 * Strategy to normalize js-joda date objects to native JavaScript Date.
 */
export class JsJodaLocalDateValueFromStrategy implements IValueFromStrategy<
  JsJodaDateType,
  Date
> {
  normalizeValue(value: JsJodaDateType): Date {
    return convert(value).toDate();
  }

  canHandle(value: unknown): value is JsJodaDateType {
    return (
      value instanceof LocalDate ||
      value instanceof LocalDateTime ||
      value instanceof ZonedDateTime
    );
  }
}

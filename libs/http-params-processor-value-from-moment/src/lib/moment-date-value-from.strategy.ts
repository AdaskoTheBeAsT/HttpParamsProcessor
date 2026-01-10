import { IValueFromStrategy } from '@adaskothebeast/http-params-processor-core';
import * as moment from 'moment';
import { Moment } from 'moment';

/**
 * Strategy to normalize Moment date objects to native JavaScript Date.
 */
export class MomentDateValueFromStrategy implements IValueFromStrategy<Moment, Date> {
  normalizeValue(value: Moment): Date {
    return value.toDate();
  }

  canHandle(value: unknown): value is Moment {
    return moment.isMoment(value);
  }
}

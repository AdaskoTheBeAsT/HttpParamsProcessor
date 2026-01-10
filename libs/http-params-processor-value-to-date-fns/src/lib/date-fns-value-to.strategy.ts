import { IValueToStrategy } from '@adaskothebeast/http-params-processor-core';
import { format } from 'date-fns';

/**
 * Strategy to serialize Date objects using date-fns format strings.
 */
export class DateFnsValueToStrategy implements IValueToStrategy<Date> {
  constructor(private readonly formatString: string = 'yyyy-MM-dd') {}

  serializeValue(value: Date): string {
    return format(value, this.formatString);
  }

  canHandle(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }
}

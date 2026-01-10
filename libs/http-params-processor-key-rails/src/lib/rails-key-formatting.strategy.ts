import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy for Ruby on Rails style key formatting.
 * Uses bracket notation for both objects and arrays: user[name], items[0]
 */
export class RailsKeyFormattingStrategy implements IKeyFormattingStrategy {
  formatObjectKey(parentKey: string, propertyKey: string): string {
    return `${parentKey}[${propertyKey}]`;
  }

  formatArrayKey(parentKey: string, index: number): string {
    return `${parentKey}[${index}]`;
  }
}

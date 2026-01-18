import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy for custom delimiter key formatting.
 * Allows specifying a custom delimiter for nested keys.
 */
export class CustomDelimiterKeyFormattingStrategy implements IKeyFormattingStrategy {
  constructor(
    private readonly objectDelimiter = ':',
    private readonly arrayFormat: 'bracket' | 'delimiter' = 'bracket',
  ) {}

  formatObjectKey(parentKey: string, propertyKey: string): string {
    return `${parentKey}${this.objectDelimiter}${propertyKey}`;
  }

  formatArrayKey(parentKey: string, index: number): string {
    if (this.arrayFormat === 'bracket') {
      return `${parentKey}[${index}]`;
    }
    return `${parentKey}${this.objectDelimiter}${index}`;
  }
}

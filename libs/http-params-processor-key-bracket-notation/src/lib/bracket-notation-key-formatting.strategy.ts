import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy for PHP-style bracket notation key formatting.
 * Converts dot notation to bracket notation: user.name -> user[name]
 */
export class BracketNotationKeyFormattingStrategy implements IKeyFormattingStrategy {
  formatObjectKey(parentKey: string, propertyKey: string): string {
    return `${parentKey}[${propertyKey}]`;
  }

  formatArrayKey(parentKey: string, index: number): string {
    return `${parentKey}[${index}]`;
  }
}

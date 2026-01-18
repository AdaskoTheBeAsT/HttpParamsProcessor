import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy for flat underscore-separated key formatting.
 * Converts nested keys to flat format: user.profile.name -> user_profile_name
 */
export class FlatKeyFormattingStrategy implements IKeyFormattingStrategy {
  constructor(private readonly separator = '_') {}

  formatObjectKey(parentKey: string, propertyKey: string): string {
    return `${parentKey}${this.separator}${propertyKey}`;
  }

  formatArrayKey(parentKey: string, index: number): string {
    return `${parentKey}${this.separator}${index}`;
  }
}

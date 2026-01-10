import { IKeyFormattingStrategy, IParamsAppender } from '@adaskothebeast/http-params-processor-core';

/**
 * Strategy that serializes complex objects/arrays as JSON strings.
 * Instead of flattening nested structures, it encodes them as JSON.
 */
export class JsonKeyFormattingStrategy implements IKeyFormattingStrategy {
  formatObjectKey(parentKey: string, propertyKey: string): string {
    return `${parentKey}.${propertyKey}`;
  }

  formatArrayKey(parentKey: string, index: number): string {
    return `${parentKey}[${index}]`;
  }

  transformComplexObject<T extends IParamsAppender>(params: T, key: string, obj: Record<string, unknown> | unknown[]): T | null {
    return params.append(key, JSON.stringify(obj)) as T;
  }
}

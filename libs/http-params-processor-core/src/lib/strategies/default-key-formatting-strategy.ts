import { IKeyFormattingStrategy } from './key-formatting-strategy.interface';

/**
 * Default key formatting strategy matching the original HttpParamsProcessor behavior.
 * - Objects: dot notation (user.name)
 * - Arrays: bracket notation (items[0])
 */
export class DefaultKeyFormattingStrategy implements IKeyFormattingStrategy {
  formatObjectKey(parentKey: string, propertyKey: string): string {
    return `${parentKey}.${propertyKey}`;
  }

  formatArrayKey(parentKey: string, index: number): string {
    return `${parentKey}[${index}]`;
  }
}

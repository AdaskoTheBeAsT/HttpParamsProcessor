import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

/**
 * How array elements are keyed.
 * - `brackets`: `items[]` – idiomatic Rails/Rack, order carries the position.
 * - `indexed`: `items[0]` – explicit indices, also accepted by Rack.
 */
export type RailsArrayFormat = 'brackets' | 'indexed';

/**
 * Strategy for Ruby on Rails (Rack) style key formatting.
 * Objects use bracket notation (`user[name]`) and arrays use empty brackets
 * (`items[]`), which is what `Rack::Utils.parse_nested_query` expects.
 *
 * Rack rebuilds arrays of hashes by starting a new hash whenever a key repeats,
 * so `arr[][id]=1&arr[][id]=2` yields `[{ id: 1 }, { id: 2 }]`. That grouping is
 * positional only, so arrays nested directly inside array elements cannot be
 * disambiguated by Rack; pass `indexed` for those payloads.
 */
export class RailsKeyFormattingStrategy implements IKeyFormattingStrategy {
  constructor(private readonly arrayFormat: RailsArrayFormat = 'brackets') {}

  formatObjectKey(parentKey: string, propertyKey: string): string {
    return `${parentKey}[${propertyKey}]`;
  }

  formatArrayKey(parentKey: string, index: number): string {
    if (this.arrayFormat === 'indexed') {
      return `${parentKey}[${index}]`;
    }
    return `${parentKey}[]`;
  }
}

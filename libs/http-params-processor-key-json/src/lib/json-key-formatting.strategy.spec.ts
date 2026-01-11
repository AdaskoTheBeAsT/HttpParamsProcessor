import { IParamsAppender } from '@adaskothebeast/http-params-processor-core';

import { JsonKeyFormattingStrategy } from './json-key-formatting.strategy';

class MockParams implements IParamsAppender {
  private params = new Map<string, string[]>();

  append(key: string, value: string): MockParams {
    const existing = this.params.get(key) || [];
    existing.push(value);
    this.params.set(key, existing);
    return this;
  }

  get(key: string): string | null {
    const values = this.params.get(key);
    return values && values.length > 0 ? values[0] : null;
  }
}

describe('JsonKeyFormattingStrategy', () => {
  let strategy: JsonKeyFormattingStrategy;

  beforeEach(() => {
    strategy = new JsonKeyFormattingStrategy();
  });

  describe('formatObjectKey', () => {
    it('should format with dot notation', () => {
      expect(strategy.formatObjectKey('user', 'name')).toBe('user.name');
    });
  });

  describe('formatArrayKey', () => {
    it('should format with bracket notation', () => {
      expect(strategy.formatArrayKey('items', 0)).toBe('items[0]');
    });
  });

  describe('transformComplexObject', () => {
    it('should serialize object as JSON string', () => {
      const params = new MockParams();
      const obj = { status: 'active', count: 5 };

      const result = strategy.transformComplexObject(params, 'filter', obj);

      expect(result).not.toBeNull();
      expect(result!.get('filter')).toBe('{"status":"active","count":5}');
    });

    it('should serialize array as JSON string', () => {
      const params = new MockParams();
      const arr = ['a', 'b', 'c'];

      const result = strategy.transformComplexObject(params, 'tags', arr);

      expect(result).not.toBeNull();
      expect(result!.get('tags')).toBe('["a","b","c"]');
    });

    it('should serialize nested objects as JSON string', () => {
      const params = new MockParams();
      const obj = {
        user: { name: 'John', age: 30 },
        active: true,
      };

      const result = strategy.transformComplexObject(params, 'data', obj);

      expect(result).not.toBeNull();
      expect(result!.get('data')).toBe(
        '{"user":{"name":"John","age":30},"active":true}',
      );
    });
  });
});

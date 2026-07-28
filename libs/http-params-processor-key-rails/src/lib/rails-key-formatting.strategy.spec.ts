import { createParamsProcessor } from '@adaskothebeast/http-params-processor-core';

import { RailsKeyFormattingStrategy } from './rails-key-formatting.strategy';

describe('RailsKeyFormattingStrategy', () => {
  let strategy: RailsKeyFormattingStrategy;

  beforeEach(() => {
    strategy = new RailsKeyFormattingStrategy();
  });

  describe('formatObjectKey', () => {
    it('should format simple property with brackets', () => {
      expect(strategy.formatObjectKey('user', 'name')).toBe('user[name]');
    });

    it('should format nested property', () => {
      expect(strategy.formatObjectKey('user[profile]', 'email')).toBe(
        'user[profile][email]',
      );
    });

    it('should handle root key', () => {
      expect(strategy.formatObjectKey('form', 'field')).toBe('form[field]');
    });
  });

  describe('formatArrayKey', () => {
    it('should format array element with empty brackets', () => {
      expect(strategy.formatArrayKey('items', 0)).toBe('items[]');
    });

    it('should ignore the index for every element', () => {
      expect(strategy.formatArrayKey('items', 7)).toBe('items[]');
    });

    it('should format nested array element', () => {
      expect(strategy.formatArrayKey('user[tags]', 2)).toBe('user[tags][]');
    });
  });

  describe('indexed array format', () => {
    beforeEach(() => {
      strategy = new RailsKeyFormattingStrategy('indexed');
    });

    it('should format array index with brackets', () => {
      expect(strategy.formatArrayKey('items', 0)).toBe('items[0]');
    });

    it('should format nested array index', () => {
      expect(strategy.formatArrayKey('user[tags]', 2)).toBe('user[tags][2]');
    });

    it('should handle large indices', () => {
      expect(strategy.formatArrayKey('data', 999)).toBe('data[999]');
    });

    it('should still use brackets for object keys', () => {
      expect(strategy.formatObjectKey('user', 'name')).toBe('user[name]');
    });
  });

  describe('integration with ParamsProcessor', () => {
    it('should repeat empty brackets for scalar arrays', () => {
      const processor = createParamsProcessor({ keyFormatter: strategy });

      expect(processor.process('p', { items: ['x', 'y'] })).toEqual([
        ['p[items][]', 'x'],
        ['p[items][]', 'y'],
      ]);
    });

    it('should emit Rack groupable keys for arrays of objects', () => {
      const processor = createParamsProcessor({
        keyFormatter: new RailsKeyFormattingStrategy(),
      });

      expect(
        processor.process('p', {
          arr: [
            { id: '1', text: 'first' },
            { id: '2', text: 'second' },
          ],
        }),
      ).toEqual([
        ['p[arr][][id]', '1'],
        ['p[arr][][text]', 'first'],
        ['p[arr][][id]', '2'],
        ['p[arr][][text]', 'second'],
      ]);
    });

    it('should keep indices when the indexed format is used', () => {
      const processor = createParamsProcessor({
        keyFormatter: new RailsKeyFormattingStrategy('indexed'),
      });

      expect(
        processor.process('p', { arr: [{ id: '1' }, { id: '2' }] }),
      ).toEqual([
        ['p[arr][0][id]', '1'],
        ['p[arr][1][id]', '2'],
      ]);
    });
  });
});

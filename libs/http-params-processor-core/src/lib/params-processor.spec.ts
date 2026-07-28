import { ParamsProcessor, createParamsProcessor } from './params-processor';
import { ValueConverter } from './strategies/value-converter';

class Money {
  constructor(public readonly amount: string) {}
}

const moneyConverter = new ValueConverter<Money, string>(
  {
    normalizeValue: (value) => value.amount,
    canHandle: (value): value is Money => value instanceof Money,
  },
  {
    serializeValue: (value) => value,
    canHandle: (value): value is string => typeof value === 'string',
  },
);

describe('ParamsProcessor', () => {
  let processor: ParamsProcessor;

  beforeEach(() => {
    processor = createParamsProcessor();
  });

  describe('process', () => {
    it('should process simple object', () => {
      const result = processor.process('filter', {
        status: 'active',
        count: 10,
      });

      expect(result).toEqual([
        ['filter.status', 'active'],
        ['filter.count', '10'],
      ]);
    });

    it('should process nested object', () => {
      const result = processor.process('filter', {
        user: { name: 'John', age: 30 },
      });

      expect(result).toEqual([
        ['filter.user.name', 'John'],
        ['filter.user.age', '30'],
      ]);
    });

    it('should process array', () => {
      const result = processor.process('items', ['a', 'b', 'c']);

      expect(result).toEqual([
        ['items[0]', 'a'],
        ['items[1]', 'b'],
        ['items[2]', 'c'],
      ]);
    });

    it('should process array of objects', () => {
      const result = processor.process('items', [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);

      expect(result).toEqual([
        ['items[0].id', '1'],
        ['items[0].name', 'Item 1'],
        ['items[1].id', '2'],
        ['items[1].name', 'Item 2'],
      ]);
    });

    it('should process deeply nested object', () => {
      const result = processor.process('query', {
        user: { profile: { address: { city: 'NYC' } } },
      });

      expect(result).toEqual([['query.user.profile.address.city', 'NYC']]);
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = processor.process('filter', { createdAt: date });

      expect(result).toEqual([
        ['filter.createdAt', '2024-01-01T00:00:00.000Z'],
      ]);
    });

    it('should handle boolean values', () => {
      const result = processor.process('filter', {
        active: true,
        deleted: false,
      });

      expect(result).toEqual([
        ['filter.active', 'true'],
        ['filter.deleted', 'false'],
      ]);
    });

    it('should skip null and undefined values', () => {
      const result = processor.process('filter', {
        a: 'value',
        b: null,
        c: undefined,
        d: 'another',
      });

      expect(result).toEqual([
        ['filter.a', 'value'],
        ['filter.d', 'another'],
      ]);
    });

    it('should detect circular references', () => {
      const obj: Record<string, unknown> = { name: 'test' };
      obj['self'] = obj;

      expect(() => processor.process('filter', obj)).toThrow(
        'Circular reference detected',
      );
    });

    it('should return empty array for null input', () => {
      const result = processor.process('filter', null);
      expect(result).toEqual([]);
    });

    it('should skip $type property', () => {
      const result = processor.process('filter', {
        $type: 'SomeType',
        name: 'test',
      });

      expect(result).toEqual([['filter.name', 'test']]);
    });

    it('should convert class instances before traversing them', () => {
      const result = processor.process(
        'filter',
        { price: new Money('12.50') },
        { valueConverters: [moneyConverter] },
      );

      expect(result).toEqual([['filter.price', '12.50']]);
    });

    it('should convert class instances inside arrays', () => {
      const result = processor.process('prices', [new Money('1'), new Money('2')], {
        valueConverters: [moneyConverter],
      });

      expect(result).toEqual([
        ['prices[0]', '1'],
        ['prices[1]', '2'],
      ]);
    });

    it('should still traverse class instances without a converter', () => {
      const result = processor.process('filter', { price: new Money('12.50') });

      expect(result).toEqual([['filter.price.amount', '12.50']]);
    });

    it('should still traverse plain objects when a converter claims objects', () => {
      const objectConverter = new ValueConverter<object, string>(
        {
          normalizeValue: () => 'claimed',
          canHandle: (value): value is object => typeof value === 'object',
        },
        {
          serializeValue: (value) => value,
          canHandle: (value): value is string => typeof value === 'string',
        },
      );

      const result = processor.process(
        'filter',
        { user: { name: 'John' } },
        { valueConverters: [objectConverter] },
      );

      expect(result).toEqual([['filter.user.name', 'John']]);
    });
  });

  describe('toQueryString', () => {
    it('should create encoded query string', () => {
      const result = processor.toQueryString('filter', {
        name: 'John Doe',
        status: 'active',
      });

      expect(result).toBe('filter.name=John%20Doe&filter.status=active');
    });

    it('should handle special characters', () => {
      const result = processor.toQueryString('filter', { query: 'a=b&c=d' });

      expect(result).toBe('filter.query=a%3Db%26c%3Dd');
    });
  });

  describe('toURLSearchParams', () => {
    it('should create URLSearchParams instance', () => {
      const result = processor.toURLSearchParams('filter', {
        status: 'active',
      });

      expect(result).toBeInstanceOf(URLSearchParams);
      expect(result.get('filter.status')).toBe('active');
    });

    it('should handle multiple values', () => {
      const result = processor.toURLSearchParams('filter', {
        status: 'active',
        type: 'user',
      });

      expect(result.get('filter.status')).toBe('active');
      expect(result.get('filter.type')).toBe('user');
    });
  });

  describe('toPlainObject', () => {
    it('should create plain object', () => {
      const result = processor.toPlainObject('filter', {
        status: 'active',
        user: { name: 'John' },
      });

      expect(result).toEqual({
        'filter.status': 'active',
        'filter.user.name': 'John',
      });
    });
  });
});

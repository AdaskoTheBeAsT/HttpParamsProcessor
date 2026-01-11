import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

import {
  FetchParamsProcessor,
  buildFetchUrl,
  createFetchParamsProcessor,
  toFetchParams,
} from './fetch-params-processor';

describe('FetchParamsProcessor', () => {
  let processor: FetchParamsProcessor;

  beforeEach(() => {
    processor = new FetchParamsProcessor();
  });

  describe('toURLSearchParams', () => {
    it('should create URLSearchParams instance', () => {
      const result = processor.toURLSearchParams('filter', {
        status: 'active',
      });

      expect(result).toBeInstanceOf(URLSearchParams);
      expect(result.get('filter.status')).toBe('active');
    });

    it('should handle nested objects', () => {
      const result = processor.toURLSearchParams('filter', {
        user: { name: 'John', age: 30 },
      });

      expect(result.get('filter.user.name')).toBe('John');
      expect(result.get('filter.user.age')).toBe('30');
    });

    it('should handle arrays', () => {
      const result = processor.toURLSearchParams('items', ['a', 'b', 'c']);

      expect(result.get('items[0]')).toBe('a');
      expect(result.get('items[1]')).toBe('b');
      expect(result.get('items[2]')).toBe('c');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = processor.toURLSearchParams('filter', { createdAt: date });

      expect(result.get('filter.createdAt')).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle boolean values', () => {
      const result = processor.toURLSearchParams('filter', {
        active: true,
        deleted: false,
      });

      expect(result.get('filter.active')).toBe('true');
      expect(result.get('filter.deleted')).toBe('false');
    });

    it('should skip null and undefined values', () => {
      const result = processor.toURLSearchParams('filter', {
        a: 'value',
        b: null,
        c: undefined,
        d: 'another',
      });

      expect(result.get('filter.a')).toBe('value');
      expect(result.get('filter.b')).toBeNull();
      expect(result.get('filter.c')).toBeNull();
      expect(result.get('filter.d')).toBe('another');
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

    it('should handle nested objects', () => {
      const result = processor.toQueryString('filter', {
        user: { name: 'John' },
      });

      expect(result).toBe('filter.user.name=John');
    });
  });

  describe('buildUrl', () => {
    it('should append query string to URL', () => {
      const result = processor.buildUrl('/api/products', 'filter', {
        status: 'active',
      });

      expect(result).toBe('/api/products?filter.status=active');
    });

    it('should handle URL with existing query params', () => {
      const result = processor.buildUrl('/api/products?page=1', 'filter', {
        status: 'active',
      });

      expect(result).toBe('/api/products?page=1&filter.status=active');
    });

    it('should return base URL if object is empty after processing', () => {
      const result = processor.buildUrl('/api/products', 'filter', {
        a: null,
        b: undefined,
      });

      expect(result).toBe('/api/products');
    });

    it('should handle nested objects', () => {
      const result = processor.buildUrl('/api/products', 'filter', {
        category: 'electronics',
        price: { min: 100, max: 500 },
      });

      expect(result).toBe(
        '/api/products?filter.category=electronics&filter.price.min=100&filter.price.max=500',
      );
    });
  });

  describe('buildUrlObject', () => {
    it('should create URL object with query params', () => {
      const result = processor.buildUrlObject(
        'https://api.example.com/products',
        'filter',
        { category: 'electronics' },
      );

      expect(result).toBeInstanceOf(URL);
      expect(result.searchParams.get('filter.category')).toBe('electronics');
    });

    it('should accept URL object as base', () => {
      const baseUrl = new URL('https://api.example.com/products');
      const result = processor.buildUrlObject(baseUrl, 'filter', {
        status: 'active',
      });

      expect(result.searchParams.get('filter.status')).toBe('active');
    });

    it('should preserve existing query params on URL object', () => {
      const baseUrl = new URL('https://api.example.com/products?page=1');
      const result = processor.buildUrlObject(baseUrl, 'filter', {
        status: 'active',
      });

      expect(result.searchParams.get('page')).toBe('1');
      expect(result.searchParams.get('filter.status')).toBe('active');
    });
  });

  describe('appendTo', () => {
    it('should append to existing URLSearchParams', () => {
      const existing = new URLSearchParams({ page: '1', size: '10' });
      const result = processor.appendTo(existing, 'filter', {
        status: 'active',
      });

      expect(result).toBe(existing);
      expect(result.get('page')).toBe('1');
      expect(result.get('size')).toBe('10');
      expect(result.get('filter.status')).toBe('active');
    });

    it('should handle nested objects', () => {
      const existing = new URLSearchParams({ page: '1' });
      processor.appendTo(existing, 'filter', { user: { name: 'John' } });

      expect(existing.get('filter.user.name')).toBe('John');
    });
  });

  describe('coreProcessor', () => {
    it('should return the underlying ParamsProcessor', () => {
      expect(processor.coreProcessor).toBeDefined();
    });
  });

  describe('with custom key formatter', () => {
    it('should use custom key formatter', () => {
      const customFormatter: IKeyFormattingStrategy = {
        formatObjectKey: (parent, prop) => `${parent}[${prop}]`,
        formatArrayKey: (parent, index) => `${parent}[${index}]`,
      };

      const customProcessor = new FetchParamsProcessor({
        keyFormatter: customFormatter,
      });

      const result = customProcessor.toQueryString('filter', {
        user: { name: 'John' },
      });

      expect(result).toBe('filter%5Buser%5D%5Bname%5D=John');
    });
  });
});

describe('createFetchParamsProcessor', () => {
  it('should create FetchParamsProcessor instance', () => {
    const processor = createFetchParamsProcessor();

    expect(processor).toBeInstanceOf(FetchParamsProcessor);
  });

  it('should accept config', () => {
    const customFormatter: IKeyFormattingStrategy = {
      formatObjectKey: (parent, prop) => `${parent}_${prop}`,
      formatArrayKey: (parent, index) => `${parent}_${index}`,
    };

    const processor = createFetchParamsProcessor({
      keyFormatter: customFormatter,
    });

    const result = processor.toQueryString('filter', { status: 'active' });

    expect(result).toBe('filter_status=active');
  });
});

describe('buildFetchUrl', () => {
  it('should build URL with query parameters', () => {
    const url = buildFetchUrl('/api/products', 'filter', {
      category: 'electronics',
      inStock: true,
    });

    expect(url).toBe(
      '/api/products?filter.category=electronics&filter.inStock=true',
    );
  });

  it('should accept config', () => {
    const customFormatter: IKeyFormattingStrategy = {
      formatObjectKey: (parent, prop) => `${parent}_${prop}`,
      formatArrayKey: (parent, index) => `${parent}_${index}`,
    };

    const url = buildFetchUrl(
      '/api/products',
      'filter',
      { status: 'active' },
      { keyFormatter: customFormatter },
    );

    expect(url).toBe('/api/products?filter_status=active');
  });
});

describe('toFetchParams', () => {
  it('should create URLSearchParams from object', () => {
    const params = toFetchParams('filter', { status: 'active' });

    expect(params).toBeInstanceOf(URLSearchParams);
    expect(params.get('filter.status')).toBe('active');
  });

  it('should accept config', () => {
    const customFormatter: IKeyFormattingStrategy = {
      formatObjectKey: (parent, prop) => `${parent}_${prop}`,
      formatArrayKey: (parent, index) => `${parent}_${index}`,
    };

    const params = toFetchParams(
      'filter',
      { status: 'active' },
      { keyFormatter: customFormatter },
    );

    expect(params.get('filter_status')).toBe('active');
  });
});

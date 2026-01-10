import {
  AxiosParamsProcessor,
  createAxiosParamsProcessor,
  createParamsSerializer,
} from './axios-params-processor';
import { IKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-core';

describe('AxiosParamsProcessor', () => {
  let processor: AxiosParamsProcessor;

  beforeEach(() => {
    processor = new AxiosParamsProcessor();
  });

  describe('serialize', () => {
    it('should serialize simple object with encoding', () => {
      const result = processor.serialize('filter', { status: 'active', count: 10 });

      expect(result).toBe('filter.status=active&filter.count=10');
    });

    it('should serialize nested object', () => {
      const result = processor.serialize('filter', {
        user: { name: 'John', age: 30 },
      });

      expect(result).toBe('filter.user.name=John&filter.user.age=30');
    });

    it('should serialize array', () => {
      const result = processor.serialize('items', ['a', 'b', 'c']);

      expect(result).toBe('items%5B0%5D=a&items%5B1%5D=b&items%5B2%5D=c');
    });

    it('should encode special characters by default', () => {
      const result = processor.serialize('filter', { query: 'hello world' });

      expect(result).toBe('filter.query=hello%20world');
    });

    it('should not encode when encode option is false', () => {
      const result = processor.serialize(
        'filter',
        { query: 'hello world' },
        { encode: false }
      );

      expect(result).toBe('filter.query=hello world');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = processor.serialize('filter', { createdAt: date });

      expect(result).toBe('filter.createdAt=2024-01-01T00%3A00%3A00.000Z');
    });

    it('should handle boolean values', () => {
      const result = processor.serialize('filter', { active: true, deleted: false });

      expect(result).toBe('filter.active=true&filter.deleted=false');
    });

    it('should skip null and undefined values', () => {
      const result = processor.serialize('filter', {
        a: 'value',
        b: null,
        c: undefined,
        d: 'another',
      });

      expect(result).toBe('filter.a=value&filter.d=another');
    });

    it('should handle empty key', () => {
      const result = processor.serialize('', { status: 'active' });

      expect(result).toBe('.status=active');
    });
  });

  describe('createSerializer', () => {
    it('should return a function', () => {
      const serializer = processor.createSerializer('filter');

      expect(typeof serializer).toBe('function');
    });

    it('should serialize when called', () => {
      const serializer = processor.createSerializer('filter');
      const result = serializer({ status: 'active' });

      expect(result).toBe('filter.status=active');
    });

    it('should respect options passed to createSerializer', () => {
      const serializer = processor.createSerializer('filter', { encode: false });
      const result = serializer({ query: 'hello world' });

      expect(result).toBe('filter.query=hello world');
    });
  });

  describe('toParams', () => {
    it('should return plain object', () => {
      const result = processor.toParams('filter', {
        status: 'active',
        user: { name: 'John' },
      });

      expect(result).toEqual({
        'filter.status': 'active',
        'filter.user.name': 'John',
      });
    });

    it('should handle arrays', () => {
      const result = processor.toParams('items', ['a', 'b']);

      expect(result).toEqual({
        'items[0]': 'a',
        'items[1]': 'b',
      });
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

      const customProcessor = new AxiosParamsProcessor({
        keyFormatter: customFormatter,
      });

      const result = customProcessor.serialize('filter', {
        user: { name: 'John' },
      });

      expect(result).toBe('filter%5Buser%5D%5Bname%5D=John');
    });
  });
});

describe('createAxiosParamsProcessor', () => {
  it('should create AxiosParamsProcessor instance', () => {
    const processor = createAxiosParamsProcessor();

    expect(processor).toBeInstanceOf(AxiosParamsProcessor);
  });

  it('should accept config', () => {
    const customFormatter: IKeyFormattingStrategy = {
      formatObjectKey: (parent, prop) => `${parent}_${prop}`,
      formatArrayKey: (parent, index) => `${parent}_${index}`,
    };

    const processor = createAxiosParamsProcessor({
      keyFormatter: customFormatter,
    });

    const result = processor.serialize('filter', { status: 'active' });

    expect(result).toBe('filter_status=active');
  });
});

describe('createParamsSerializer', () => {
  it('should create a serializer function', () => {
    const serializer = createParamsSerializer('filter');

    expect(typeof serializer).toBe('function');
  });

  it('should serialize objects', () => {
    const serializer = createParamsSerializer('filter');
    const result = serializer({ status: 'active' });

    expect(result).toBe('filter.status=active');
  });

  it('should accept config', () => {
    const customFormatter: IKeyFormattingStrategy = {
      formatObjectKey: (parent, prop) => `${parent}_${prop}`,
      formatArrayKey: (parent, index) => `${parent}_${index}`,
    };

    const serializer = createParamsSerializer('filter', {
      keyFormatter: customFormatter,
    });

    const result = serializer({ status: 'active' });

    expect(result).toBe('filter_status=active');
  });
});

import { TestBed } from '@angular/core/testing';

import { HttpParamsProcessorService } from './http-params-processor.service';

describe('HttpParamsProcessorService', () => {
  let service: HttpParamsProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpParamsProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should process undefined', () => {
    const httpParams = service.process('p', undefined);
    const result = httpParams.toString();
    expect(result).toBe('');
  });

  it('should process null', () => {
    const httpParams = service.process('p', null);
    const result = httpParams.toString();
    expect(result).toBe('');
  });

  it('should process text with space', () => {
    const httpParams = service.process('p', 'text1 text2');
    const result = httpParams.toString();
    expect(result).toBe('p=text1%20text2');
  });

  it('should process array', () => {
    const httpParams = service.process('p', [1, 2]);
    const result = httpParams.toString();
    expect(result).toBe('p%5B0%5D=1&p%5B1%5D=2');
  });

  it('should process empty object', () => {
    const httpParams = service.process('p', {});
    const result = httpParams.toString();
    expect(result).toBe('');
  });

  it('should process simple object', () => {
    const httpParams = service.process('p', { a: 1 });
    const result = httpParams.toString();
    expect(result).toBe('p.a=1');
  });

  it('should process simple object with two properties', () => {
    const httpParams = service.process('p', { a: 1, b: 'text' });
    const result = httpParams.toString();
    expect(result).toBe('p.a=1&p.b=text');
  });

  it('should process object with array', () => {
    const httpParams = service.process('p', { a: [1, 2] });
    const result = httpParams.toString();
    expect(result).toBe('p.a%5B0%5D=1&p.a%5B1%5D=2');
  });

  it('should process object with internal object', () => {
    const httpParams = service.process('p', {
      a: {
        b: 1,
        c: 'text',
      },
    });
    const result = httpParams.toString();
    expect(result).toBe('p.a.b=1&p.a.c=text');
  });

  it('should process array of object', () => {
    const httpParams = service.process('p', [
      {
        a: 1,
        b: 'text',
      },
      {
        a: 2,
      },
    ]);
    const result = httpParams.toString();
    expect(result).toBe('p%5B0%5D.a=1&p%5B0%5D.b=text&p%5B1%5D.a=2');
  });

  it('should process complex object tree', () => {
    const httpParams = service.process('p', {
      arr: [
        {
          id: '1',
          innerArr: [
            {
              id: '1.1',
              text: 'first first',
            },
            {
              id: '1.2',
              text: 'first second',
            },
          ],
        },
        {
          id: '2',
          innerArr: [
            {
              id: '2.1',
              text: 'second first',
            },
            {
              id: '2.2',
              text: 'second second',
            },
          ],
        },
      ],
    });
    const result = httpParams.toString();
    expect(result).toBe(
      'p.arr%5B0%5D.id=1&p.arr%5B0%5D.innerArr%5B0%5D.id=1.1&p.arr%5B0%5D.innerArr%5B0%5D.text=first%20first&p.arr%5B0%5D.innerArr%5B1%5D.id=1.2&p.arr%5B0%5D.innerArr%5B1%5D.text=first%20second&p.arr%5B1%5D.id=2&p.arr%5B1%5D.innerArr%5B0%5D.id=2.1&p.arr%5B1%5D.innerArr%5B0%5D.text=second%20first&p.arr%5B1%5D.innerArr%5B1%5D.id=2.2&p.arr%5B1%5D.innerArr%5B1%5D.text=second%20second'
    );
  });

  it('should process simple object with type', () => {
    const httpParams = service.process('p', { $type: 'classA', a: 1 });
    const result = httpParams.toString();
    expect(result).toBe('p.a=1');
  });
});

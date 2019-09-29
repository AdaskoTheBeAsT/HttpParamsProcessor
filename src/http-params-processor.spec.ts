import { async } from '@angular/core/testing';
import { HttpParamsProcessor } from './http-params-processor';

describe('HttpParamsProcessor', () => {
  beforeEach(async(() => {}));

  it('should create encoder', async(() => {
    const hpp = new HttpParamsProcessor();
    expect(hpp).toBeTruthy();
  }));

  it('should process undefined', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', undefined);
    const result = httpParams.toString();
    expect(result).toBe('');
  }));

  it('should process null', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', null);
    const result = httpParams.toString();
    expect(result).toBe('');
  }));

  it('should process text with space', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', 'text1 text2');
    const result = httpParams.toString();
    expect(result).toBe('p=text1%20text2');
  }));

  it('should process array', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', [1, 2]);
    const result = httpParams.toString();
    expect(result).toBe('p%5B0%5D=1&p%5B1%5D=2');
  }));

  it('should process empty object', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', {});
    const result = httpParams.toString();
    expect(result).toBe('');
  }));

  it('should process simple object', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', { a: 1 });
    const result = httpParams.toString();
    expect(result).toBe('p.a=1');
  }));

  it('should process simple object with two properties', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', { a: 1, b: 'text' });
    const result = httpParams.toString();
    expect(result).toBe('p.a=1&p.b=text');
  }));

  it('should process object with array', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', { a: [1, 2] });
    const result = httpParams.toString();
    expect(result).toBe('p.a%5B0%5D=1&p.a%5B1%5D=2');
  }));

  it('should process object with internal object', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', {
      a: {
        b: 1,
        c: 'text',
      },
    });
    const result = httpParams.toString();
    expect(result).toBe('p.a.b=1&p.a.c=text');
  }));

  it('should process array of object', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', [
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
  }));

  it('should process complex object tree', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', {
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
  }));

  it('should process simple object with type', async(() => {
    const hpp = new HttpParamsProcessor();
    const httpParams = hpp.process('p', { $type: 'classA', a: 1 });
    const result = httpParams.toString();
    expect(result).toBe('p.a=1');
  }));
});

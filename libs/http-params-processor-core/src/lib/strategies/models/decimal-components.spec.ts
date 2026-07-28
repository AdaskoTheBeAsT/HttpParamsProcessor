import { isDecimalComponents } from './decimal-components';

describe('isDecimalComponents', () => {
  it('should accept plain decimal literals', () => {
    expect(isDecimalComponents({ decimal: '0' })).toBe(true);
    expect(isDecimalComponents({ decimal: '-0.001' })).toBe(true);
    expect(isDecimalComponents({ decimal: '+42' })).toBe(true);
    expect(isDecimalComponents({ decimal: '.5' })).toBe(true);
  });

  it('should reject exponential and malformed literals', () => {
    expect(isDecimalComponents({ decimal: '1.25e+8' })).toBe(false);
    expect(isDecimalComponents({ decimal: '1 000' })).toBe(false);
    expect(isDecimalComponents({ decimal: '' })).toBe(false);
    expect(isDecimalComponents({ decimal: 'NaN' })).toBe(false);
  });

  it('should reject other shapes', () => {
    expect(isDecimalComponents({ decimal: 1 })).toBe(false);
    expect(isDecimalComponents('1.5')).toBe(false);
    expect(isDecimalComponents(null)).toBe(false);
  });
});

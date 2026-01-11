import { DateFnsValueToStrategy } from './date-fns-value-to.strategy';

describe('DateFnsValueToStrategy', () => {
  describe('with default format', () => {
    let strategy: DateFnsValueToStrategy;

    beforeEach(() => {
      strategy = new DateFnsValueToStrategy();
    });

    describe('canHandle', () => {
      it('should return true for valid Date objects', () => {
        expect(strategy.canHandle(new Date('2024-01-01'))).toBe(true);
      });

      it('should return false for invalid Date objects', () => {
        expect(strategy.canHandle(new Date('invalid'))).toBe(false);
      });

      it('should return false for strings', () => {
        expect(strategy.canHandle('2024-01-01')).toBe(false);
      });
    });

    describe('serializeValue', () => {
      it('should format date as yyyy-MM-dd by default', () => {
        const date = new Date('2024-01-15T10:30:00.000Z');
        const result = strategy.serializeValue(date);

        expect(result).toBe('2024-01-15');
      });
    });
  });

  describe('with custom format', () => {
    it('should use MM/dd/yyyy format', () => {
      const strategy = new DateFnsValueToStrategy('MM/dd/yyyy');
      const date = new Date('2024-01-15T00:00:00.000Z');

      expect(strategy.serializeValue(date)).toBe('01/15/2024');
    });

    it('should use full datetime format', () => {
      const strategy = new DateFnsValueToStrategy("yyyy-MM-dd'T'HH:mm:ss");
      const date = new Date('2024-01-15T10:30:45.000Z');

      const result = strategy.serializeValue(date);
      expect(result).toMatch(/2024-01-15T\d{2}:30:45/);
    });

    it('should use date with time', () => {
      const strategy = new DateFnsValueToStrategy('yyyy-MM-dd HH:mm');
      const date = new Date('2024-06-15T14:30:00.000Z');

      const result = strategy.serializeValue(date);
      expect(result).toMatch(/2024-06-15 \d{2}:30/);
    });
  });
});

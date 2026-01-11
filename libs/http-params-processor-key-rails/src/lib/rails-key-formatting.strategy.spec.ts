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
    it('should format array index with brackets', () => {
      expect(strategy.formatArrayKey('items', 0)).toBe('items[0]');
    });

    it('should format nested array index', () => {
      expect(strategy.formatArrayKey('user[tags]', 2)).toBe('user[tags][2]');
    });

    it('should handle large indices', () => {
      expect(strategy.formatArrayKey('data', 999)).toBe('data[999]');
    });
  });
});

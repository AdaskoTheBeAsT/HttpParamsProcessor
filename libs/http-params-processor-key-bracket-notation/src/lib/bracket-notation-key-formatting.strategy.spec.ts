import { BracketNotationKeyFormattingStrategy } from './bracket-notation-key-formatting.strategy';

describe('BracketNotationKeyFormattingStrategy', () => {
  let strategy: BracketNotationKeyFormattingStrategy;

  beforeEach(() => {
    strategy = new BracketNotationKeyFormattingStrategy();
  });

  describe('formatObjectKey', () => {
    it('should format simple property', () => {
      expect(strategy.formatObjectKey('user', 'name')).toBe('user[name]');
    });

    it('should format nested property', () => {
      expect(strategy.formatObjectKey('user[profile]', 'email')).toBe('user[profile][email]');
    });

    it('should handle numeric property keys', () => {
      expect(strategy.formatObjectKey('data', '0')).toBe('data[0]');
    });
  });

  describe('formatArrayKey', () => {
    it('should format array index', () => {
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

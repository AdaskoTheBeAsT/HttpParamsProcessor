import { FlatKeyFormattingStrategy } from './flat-key-formatting.strategy';

describe('FlatKeyFormattingStrategy', () => {
  describe('with default separator', () => {
    let strategy: FlatKeyFormattingStrategy;

    beforeEach(() => {
      strategy = new FlatKeyFormattingStrategy();
    });

    describe('formatObjectKey', () => {
      it('should format simple property with underscore', () => {
        expect(strategy.formatObjectKey('user', 'name')).toBe('user_name');
      });

      it('should format nested property', () => {
        expect(strategy.formatObjectKey('user_profile', 'email')).toBe('user_profile_email');
      });
    });

    describe('formatArrayKey', () => {
      it('should format array index with underscore', () => {
        expect(strategy.formatArrayKey('items', 0)).toBe('items_0');
      });

      it('should format nested array index', () => {
        expect(strategy.formatArrayKey('user_tags', 2)).toBe('user_tags_2');
      });
    });
  });

  describe('with custom separator', () => {
    it('should use dash separator', () => {
      const strategy = new FlatKeyFormattingStrategy('-');
      expect(strategy.formatObjectKey('user', 'name')).toBe('user-name');
    });

    it('should use double underscore separator', () => {
      const strategy = new FlatKeyFormattingStrategy('__');
      expect(strategy.formatObjectKey('user', 'name')).toBe('user__name');
    });
  });
});

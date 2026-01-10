import { CustomDelimiterKeyFormattingStrategy } from './custom-delimiter-key-formatting.strategy';

describe('CustomDelimiterKeyFormattingStrategy', () => {
  describe('with default delimiter', () => {
    let strategy: CustomDelimiterKeyFormattingStrategy;

    beforeEach(() => {
      strategy = new CustomDelimiterKeyFormattingStrategy();
    });

    describe('formatObjectKey', () => {
      it('should format with colon delimiter', () => {
        expect(strategy.formatObjectKey('user', 'name')).toBe('user:name');
      });

      it('should format nested property', () => {
        expect(strategy.formatObjectKey('user:profile', 'email')).toBe('user:profile:email');
      });
    });

    describe('formatArrayKey', () => {
      it('should format array index with brackets by default', () => {
        expect(strategy.formatArrayKey('items', 0)).toBe('items[0]');
      });
    });
  });

  describe('with custom delimiters', () => {
    it('should use arrow delimiter', () => {
      const strategy = new CustomDelimiterKeyFormattingStrategy('->');
      expect(strategy.formatObjectKey('user', 'name')).toBe('user->name');
    });

    it('should use slash delimiter', () => {
      const strategy = new CustomDelimiterKeyFormattingStrategy('/');
      expect(strategy.formatObjectKey('api', 'users')).toBe('api/users');
    });

    it('should use delimiter format for arrays', () => {
      const strategy = new CustomDelimiterKeyFormattingStrategy(':', 'delimiter');
      expect(strategy.formatArrayKey('items', 2)).toBe('items:2');
    });
  });
});

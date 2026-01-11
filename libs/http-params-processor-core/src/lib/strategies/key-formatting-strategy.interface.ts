/**
 * Generic params object interface for key formatting strategies.
 * This is framework-agnostic and can be implemented by URLSearchParams, etc.
 */
export interface IParamsAppender {
  append(key: string, value: string): IParamsAppender;
}

/**
 * Strategy interface for formatting query parameter keys.
 * Handles HOW to format nested object and array keys.
 *
 * This is separate from value serialization to allow composition:
 * - Dot notation (user.name) + ISO dates
 * - Bracket notation (user[name]) + Unix timestamps
 * - Flat underscore (user_name) + custom date formats
 */
export interface IKeyFormattingStrategy {
  /**
   * Formats a nested object property key.
   * @param parentKey - The parent key
   * @param propertyKey - The property key
   * @returns Formatted key string
   * @example
   * // Dot Notation Strategy
   * formatObjectKey('user', 'name') => 'user.name'
   *
   * // Bracket Notation Strategy
   * formatObjectKey('user', 'name') => 'user[name]'
   *
   * // Flat Underscore Strategy
   * formatObjectKey('user', 'name') => 'user_name'
   */
  formatObjectKey(parentKey: string, propertyKey: string): string;

  /**
   * Formats an array element key.
   * @param parentKey - The parent key
   * @param index - The array index
   * @returns Formatted key string
   * @example
   * // Bracket Notation Strategy (default)
   * formatArrayKey('items', 0) => 'items[0]'
   *
   * // Dot Notation Strategy
   * formatArrayKey('items', 0) => 'items.0'
   *
   * // Flat Underscore Strategy
   * formatArrayKey('items', 0) => 'items_0'
   */
  formatArrayKey(parentKey: string, index: number): string;

  /**
   * Optional: Transform complex object into query param format.
   * For strategies that want to serialize complex objects as JSON strings, etc.
   * @param params - Current params appender
   * @param key - The parameter key
   * @param obj - The complex object
   * @returns Updated params or null to use default recursion
   * @example
   * // JSON String Strategy
   * transformComplexObject(params, 'filter', { status: 'active' })
   *   => params.append('filter', '{"status":"active"}')
   *
   * // Default (null = use recursion)
   * transformComplexObject(params, 'filter', { status: 'active' }) => null
   */
  transformComplexObject?<T extends IParamsAppender>(
    params: T,
    key: string,
    obj: Record<string, unknown> | unknown[],
  ): T | null;
}

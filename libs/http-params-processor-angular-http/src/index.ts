// Legacy module (for backwards compatibility)
export * from './lib/http-params-processor.module';

// Re-export everything from the base angular lib
export {
  // Service and DI tokens
  HttpParamsProcessorService,
  HttpParamsProcessorOptions,
  HTTP_PARAMS_KEY_FORMATTER,
  HTTP_PARAMS_VALUE_CONVERTERS,
  // Angular-specific key formatting interface
  IKeyFormattingStrategy,
  // Core re-exports
  DefaultKeyFormattingStrategy,
  IKeyFormattingStrategyCore,
  IParamsAppender,
  IValueFromStrategy,
  IValueToStrategy,
  IValueConverter,
  ValueConverter,
  createValueConverter,
  DefaultDateValueFromStrategy,
  DefaultDateValueToStrategy,
  DefaultPrimitiveValueToStrategy,
  DurationComponents,
  PeriodComponents,
} from '@adaskothebeast/http-params-processor-angular';

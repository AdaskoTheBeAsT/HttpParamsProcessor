export * from './lib/fetch-params-processor';

// Re-export core types for convenience
export type {
  ParamsProcessorOptions,
  ProcessableInput,
  ParamsEntry,
  IKeyFormattingStrategy,
  IValueConverter,
  IValueFromStrategy,
  IValueToStrategy,
  DurationComponents,
  PeriodComponents,
} from '@adaskothebeast/http-params-processor-core';

export {
  ValueConverter,
  createValueConverter,
  DefaultKeyFormattingStrategy,
  DefaultDateValueFromStrategy,
  DefaultDateValueToStrategy,
  DefaultPrimitiveValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';

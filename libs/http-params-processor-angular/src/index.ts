// Angular service and DI tokens
export * from './lib/http-params-processor.service';

// Angular-specific key formatting interface (uses HttpParams)
export * from './lib/strategies/key-formatting-strategy.interface';

export * from './lib/http-params-processor.module';

// Re-export types from core
export type {
  IKeyFormattingStrategy as IKeyFormattingStrategyCore,
  IParamsAppender,
  IValueFromStrategy,
  IValueToStrategy,
  IValueConverter,
  DurationComponents,
  PeriodComponents,
} from '@adaskothebeast/http-params-processor-core';

// Re-export classes/functions from core
export {
  DefaultKeyFormattingStrategy,
  ValueConverter,
  createValueConverter,
  DefaultDateValueFromStrategy,
  DefaultDateValueToStrategy,
  DefaultPrimitiveValueToStrategy,
} from '@adaskothebeast/http-params-processor-core';

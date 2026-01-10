# HttpParamsProcessor

> Transform complex TypeScript objects into query parameters for Angular, Axios, Fetch, and more

[![npm version](https://img.shields.io/npm/v/@adaskothebeast/http-params-processor.svg)](https://www.npmjs.com/package/@adaskothebeast/http-params-processor)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20.x-red.svg)](https://angular.io/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/AdaskoTheBeAsT/HttpParamsProcessor)

## The Problem

Ever struggled with sending complex nested objects as query parameters in Angular GET requests? Manually building query strings for deeply nested objects is tedious, error-prone, and hard to maintain.

```typescript
// The old way - manual & painful
let params = new HttpParams()
  .set('user.name', 'John')
  .set('user.address.city', 'New York')
  .set('filters[0].type', 'category')
  .set('filters[0].value', 'electronics')
  // ... and so on
```

## The Solution

HttpParamsProcessor automatically converts any TypeScript object (including nested objects and arrays) into properly formatted Angular HttpParams - perfect for GET requests to REST APIs.

```typescript
// The new way - automatic & elegant
const params = processor.process('query', {
  user: { name: 'John', address: { city: 'New York' } },
  filters: [{ type: 'category', value: 'electronics' }]
});
```

## Installation

```bash
npm install @adaskothebeast/http-params-processor
```

## Quick Start

### 1. Import the Service

The service is automatically provided in root - no module imports needed!

```typescript
import { HttpParamsProcessorService } from '@adaskothebeast/http-params-processor';
```

### 2. Inject and Use

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParamsProcessorService } from '@adaskothebeast/http-params-processor';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private http: HttpClient,
    private processor: HttpParamsProcessorService
  ) {}

  searchProducts(filters: ProductFilters) {
    const params = this.processor.process('filter', filters);
    return this.http.get<Product[]>('/api/products', { params });
  }
}
```

## Features

- **Zero Configuration** - Works out of the box
- **Deep Nesting** - Handles objects, arrays, and nested combinations
- **Date Support** - Automatically converts dates to ISO format
- **Type Safe** - Full TypeScript support
- **Well Tested** - Comprehensive test coverage
- **Lightweight** - No external dependencies
- **Circular Reference Detection** - Prevents infinite loops
- **Plugin Architecture** - Extensible value converters for different API styles

## Usage Examples

### Simple Object

```typescript
const params = processor.process('user', { id: 123, name: 'John Doe' });
// Result: user.id=123&user.name=John%20Doe
```

### Nested Objects

```typescript
const params = processor.process('query', {
  user: { profile: { firstName: 'John', lastName: 'Doe' } }
});
// Result: query.user.profile.firstName=John&query.user.profile.lastName=Doe
```

### Arrays

```typescript
const params = processor.process('items', [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
]);
// Result: items[0].id=1&items[0].name=Item%201&items[1].id=2&items[1].name=Item%202
```

### Date Handling

```typescript
const params = processor.process('filter', {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
// Result: filter.startDate=2024-01-01T00:00:00.000Z&filter.endDate=2024-12-31T00:00:00.000Z
```

### Extending Existing HttpParams

```typescript
let params = new HttpParams().set('page', '1').set('size', '10');
params = processor.processWithParams(params, 'filter', { status: 'active' });
// Result: page=1&size=10&filter.status=active
```

## Plugin Architecture - Value Converter Pipeline

HttpParamsProcessor supports a **two-stage value converter pipeline**:

1. **value-from** - Normalizes library-specific types to intermediate types (Date, DurationComponents, PeriodComponents)
2. **value-to** - Serializes intermediate types to string output

This allows mixing any input library (dayjs, moment, luxon, js-joda) with any output format (ISO, Unix timestamp, NodaTime).

### Available Plugin Libraries

#### Key Formatting (how to format nested keys)

| Library | Format | Use Case |
|---------|--------|----------|
| **Default** (built-in) | `user.name`, `items[0]` | ASP.NET Core, most APIs |
| `key-bracket-notation` | `user[name]`, `items[0]` | PHP, Symfony, Laravel |
| `key-flat` | `user_profile_name` | Flat structure APIs |
| `key-json` | `filter={"status":"active"}` | APIs accepting JSON params |
| `key-custom-delimiter` | `user:name`, `user->name` | Custom delimiters |
| `key-rails` | `user[name]`, `items[0]` | Ruby on Rails |

#### Value From (input normalization)

| Library | Converts | To |
|---------|----------|-----|
| `value-from-dayjs` | Dayjs, dayjs.Duration | Date, DurationComponents |
| `value-from-moment` | Moment, moment.Duration | Date, DurationComponents |
| `value-from-luxon` | DateTime, Duration | Date, DurationComponents |
| `value-from-js-joda` | LocalDate, Duration, Period | Date, DurationComponents, PeriodComponents |

#### Value To (output serialization)

| Library | Input | Output |
|---------|-------|--------|
| `value-to-unix-timestamp` | Date | `"1704067200"` |
| `value-to-ms-timestamp` | Date | `"1704067200000"` |
| `value-to-iso` | Date, DurationComponents, PeriodComponents | ISO 8601 format |
| `value-to-nodatime` | Date, DurationComponents, PeriodComponents | NodaTime format |
| `value-to-date-fns` | Date | Custom format via date-fns |

### Using Value Converters

```typescript
import { 
  HttpParamsProcessorService, 
  createValueConverter 
} from '@adaskothebeast/http-params-processor';
import { DayjsDateValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-dayjs';
import { UnixTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-unix-timestamp';
import dayjs from 'dayjs';

const params = processor.process('filter', 
  { createdAt: dayjs('2024-01-01') },
  {
    valueConverters: [
      createValueConverter(
        new DayjsDateValueFromStrategy(),
        new UnixTimestampValueToStrategy()
      )
    ]
  }
);
// Result: filter.createdAt=1704067200
```

### Using Key Formatters

```typescript
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';

const params = processor.process('filter', 
  { user: { name: 'John' } },
  {
    keyFormatter: new BracketNotationKeyFormattingStrategy()
  }
);
// Result: filter[user][name]=John
```

### App-Wide Configuration via DI

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { 
  HTTP_PARAMS_KEY_FORMATTER, 
  HTTP_PARAMS_VALUE_CONVERTERS,
  createValueConverter 
} from '@adaskothebeast/http-params-processor';
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';
import { DayjsDateValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-dayjs';
import { UnixTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-unix-timestamp';

export const appConfig: ApplicationConfig = {
  providers: [
    { 
      provide: HTTP_PARAMS_KEY_FORMATTER, 
      useClass: BracketNotationKeyFormattingStrategy 
    },
    {
      provide: HTTP_PARAMS_VALUE_CONVERTERS,
      useValue: [
        createValueConverter(
          new DayjsDateValueFromStrategy(),
          new UnixTimestampValueToStrategy()
        )
      ]
    }
  ]
};
```

### Complete Example with Duration + NodaTime Backend

```typescript
import { 
  DayjsDateValueFromStrategy, 
  DayjsDurationValueFromStrategy 
} from '@adaskothebeast/http-params-processor-value-from-dayjs';
import { 
  NodaTimeDateValueToStrategy, 
  NodaTimeDurationValueToStrategy 
} from '@adaskothebeast/http-params-processor-value-to-nodatime';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const params = processor.process('filter', {
  createdAt: dayjs('2024-01-01'),
  timeout: dayjs.duration({ hours: 1, minutes: 30 })
}, {
  valueConverters: [
    createValueConverter(new DayjsDateValueFromStrategy(), new NodaTimeDateValueToStrategy()),
    createValueConverter(new DayjsDurationValueFromStrategy(), new NodaTimeDurationValueToStrategy())
  ]
});
```

## API Reference

### `process(key, obj, options?): HttpParams`

Creates a new `HttpParams` instance from the provided object.

**Parameters:**
- `key` - The root parameter name
- `obj` - The object to convert
- `options` - Optional configuration:
  - `keyFormatter` - Custom key formatting strategy
  - `valueConverters` - Array of value converters

### `processWithParams(params, key, obj, options?): HttpParams`

Adds parameters to an existing `HttpParams` instance.

### Injection Tokens

- `HTTP_PARAMS_KEY_FORMATTER` - Provide a default key formatter
- `HTTP_PARAMS_VALUE_CONVERTERS` - Provide default value converters

## Intermediate Types

For Duration and Period handling, the library defines intermediate types:

```typescript
interface DurationComponents {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

interface PeriodComponents {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
}
```

## Requirements

- Angular 20.x or higher (for Angular adapter)
- TypeScript 5.x or higher

---

## 🆕 Framework-Agnostic Adapters

In addition to the Angular library, we now provide **framework-agnostic adapters** for Axios and Fetch!

### Package Overview

| Package | Use Case | Install |
|---------|----------|---------|
| `@adaskothebeast/http-params-processor-core` | Core logic, framework-agnostic | `npm i @adaskothebeast/http-params-processor-core` |
| `@adaskothebeast/http-params-processor-axios` | Axios integration | `npm i @adaskothebeast/http-params-processor-core @adaskothebeast/http-params-processor-axios` |
| `@adaskothebeast/http-params-processor-fetch` | Fetch API / URLSearchParams | `npm i @adaskothebeast/http-params-processor-core @adaskothebeast/http-params-processor-fetch` |
| `@adaskothebeast/http-params-processor` | Angular HttpParams | `npm i @adaskothebeast/http-params-processor` |
| `@adaskothebeast/http-params-processor-resource` | Angular httpResource | `npm i @adaskothebeast/http-params-processor-resource` |
| `@adaskothebeast/http-params-processor-tanstack-query` | TanStack Query (React Query) | `npm i @adaskothebeast/http-params-processor-tanstack-query` |
| `@adaskothebeast/http-params-processor-swr` | SWR (React) | `npm i @adaskothebeast/http-params-processor-swr` |

### Axios Example

```typescript
import axios from 'axios';
import { createAxiosParamsProcessor } from '@adaskothebeast/http-params-processor-axios';

const processor = createAxiosParamsProcessor();

// Use with paramsSerializer
axios.get('/api/products', {
  params: {
    filter: {
      category: 'electronics',
      price: { min: 100, max: 500 }
    }
  },
  paramsSerializer: processor.createSerializer('')
});
// URL: /api/products?filter.category=electronics&filter.price.min=100&filter.price.max=500

// Or set globally
axios.defaults.paramsSerializer = processor.createSerializer('');
```

### Fetch Example

```typescript
import { createFetchParamsProcessor } from '@adaskothebeast/http-params-processor-fetch';

const processor = createFetchParamsProcessor();

// Build URL with query parameters
const url = processor.buildUrl('/api/products', 'filter', {
  category: 'electronics',
  tags: ['new', 'featured']
});

const response = await fetch(url);
// URL: /api/products?filter.category=electronics&filter.tags[0]=new&filter.tags[1]=featured

// Or use URLSearchParams directly
const params = processor.toURLSearchParams('filter', { status: 'active' });
fetch(`/api/data?${params}`);
```

### React Hook Example

```typescript
import { useMemo } from 'react';
import { createFetchParamsProcessor } from '@adaskothebeast/http-params-processor-fetch';

function useApiUrl(baseUrl: string, filters: Record<string, unknown>) {
  const processor = useMemo(() => createFetchParamsProcessor(), []);
  return useMemo(
    () => processor.buildUrl(baseUrl, 'filter', filters),
    [processor, baseUrl, filters]
  );
}

// Usage with React Query / SWR
function ProductList({ filters }) {
  const url = useApiUrl('/api/products', filters);
  const { data } = useQuery(['products', url], () => fetch(url).then(r => r.json()));
}
```

### Using Key Formatters with Any Adapter

All adapters support the same key formatting strategies:

```typescript
import { createAxiosParamsProcessor } from '@adaskothebeast/http-params-processor-axios';
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';

const processor = createAxiosParamsProcessor({
  keyFormatter: new BracketNotationKeyFormattingStrategy()
});

// Creates: filter[user][name]=John instead of filter.user.name=John
```

### Using Value Converters with Any Adapter

```typescript
import { createFetchParamsProcessor, createValueConverter } from '@adaskothebeast/http-params-processor-fetch';
import { DayjsDateValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-dayjs';
import { UnixTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-unix-timestamp';
import dayjs from 'dayjs';

const processor = createFetchParamsProcessor({
  valueConverters: [
    createValueConverter(
      new DayjsDateValueFromStrategy(),
      new UnixTimestampValueToStrategy()
    )
  ]
});

const url = processor.buildUrl('/api/events', 'filter', {
  startDate: dayjs('2024-01-01')
});
// URL: /api/events?filter.startDate=1704067200
```

### Angular httpResource Example

Angular 19+ introduced `httpResource` for declarative data fetching. Use `http-params-processor-resource` for seamless integration:

```typescript
import { Component, signal } from '@angular/core';
import { httpResourceWithParams } from '@adaskothebeast/http-params-processor-resource';

@Component({
  selector: 'app-products',
  template: `
    @if (products.isLoading()) {
      <p>Loading...</p>
    }
    @if (products.value(); as data) {
      <ul>
        @for (product of data; track product.id) {
          <li>{{ product.name }}</li>
        }
      </ul>
    }
  `
})
export class ProductsComponent {
  filters = signal({ category: 'electronics', inStock: true });

  products = httpResourceWithParams<Product[]>({
    url: '/api/products',
    paramsKey: 'filter',
    params: this.filters
  });
}
```

#### Reactive httpResource with Computed Params

```typescript
import { computed, signal } from '@angular/core';
import { reactiveHttpResourceWithParams } from '@adaskothebeast/http-params-processor-resource';

@Component({ /* ... */ })
export class SearchComponent {
  searchTerm = signal('');
  category = signal('all');

  // Params are computed reactively
  searchParams = computed(() => ({
    q: this.searchTerm(),
    category: this.category(),
    timestamp: new Date()
  }));

  results = reactiveHttpResourceWithParams<SearchResult[]>({
    url: '/api/search',
    paramsKey: 'query',
    params: this.searchParams
  });
}
```

### TanStack Query (React Query) Example

For React applications using TanStack Query v5+:

```typescript
import { useQueryWithParams } from '@adaskothebeast/http-params-processor-tanstack-query';

function ProductList() {
  const { data, isLoading, error } = useQueryWithParams<Product[]>({
    queryKey: ['products'],
    url: '/api/products',
    paramsKey: 'filter',
    params: {
      category: 'electronics',
      price: { min: 100, max: 500 },
      tags: ['new', 'featured']
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
// Query URL: /api/products?filter.category=electronics&filter.price.min=100&filter.price.max=500&filter.tags[0]=new&filter.tags[1]=featured
```

#### Prefetching with TanStack Query

```typescript
import { createQueryOptionsWithParams } from '@adaskothebeast/http-params-processor-tanstack-query';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const queryClient = useQueryClient();

  const prefetchProducts = async () => {
    await queryClient.prefetchQuery(
      createQueryOptionsWithParams<Product[]>({
        queryKey: ['products'],
        url: '/api/products',
        paramsKey: 'filter',
        params: { featured: true }
      })
    );
  };

  return <button onMouseEnter={prefetchProducts}>View Products</button>;
}
```

#### With Custom Key Formatter

```typescript
import { useQueryWithParams } from '@adaskothebeast/http-params-processor-tanstack-query';
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';

const { data } = useQueryWithParams<User[]>({
  queryKey: ['users'],
  url: '/api/users',
  paramsKey: 'filter',
  params: { status: 'active' },
  processorOptions: {
    keyFormatter: new BracketNotationKeyFormattingStrategy()
  }
});
// Query URL: /api/users?filter[status]=active
```

### SWR Example

For React applications using SWR:

```typescript
import { useSWRWithParams } from '@adaskothebeast/http-params-processor-swr';

function UserList() {
  const { data, error, isLoading, mutate } = useSWRWithParams<User[]>({
    url: '/api/users',
    paramsKey: 'filter',
    params: {
      status: 'active',
      roles: ['admin', 'editor'],
      pagination: { page: 1, size: 20 }
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <>
      <ul>
        {data?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button onClick={() => mutate()}>Refresh</button>
    </>
  );
}
// Query URL: /api/users?filter.status=active&filter.roles[0]=admin&filter.roles[1]=editor&filter.pagination.page=1&filter.pagination.size=20
```

#### With SWR Options

```typescript
import { useSWRWithParams } from '@adaskothebeast/http-params-processor-swr';

const { data } = useSWRWithParams<Product[]>({
  url: '/api/products',
  paramsKey: 'filter',
  params: { category: 'electronics' },
  swrOptions: {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    dedupingInterval: 2000
  }
});
```

#### Creating Custom Fetchers

```typescript
import { createFetcherWithParams, createSWRKey } from '@adaskothebeast/http-params-processor-swr';
import useSWR from 'swr';

// Create a reusable fetcher with params processing
const fetcher = createFetcherWithParams<Product[]>({
  paramsKey: 'filter',
  params: { status: 'active' },
  fetchOptions: {
    headers: { 'Authorization': 'Bearer token' }
  }
});

// Use with standard useSWR
const { data } = useSWR('/api/products', fetcher);

// Get the SWR key for cache manipulation
const cacheKey = createSWRKey('/api/products', 'filter', { status: 'active' });
```

---

## Migration Guide

### Migrating from `@adaskothebeast/http-params-processor` to `@adaskothebeast/http-params-processor-angular-http`

The original `http-params-processor` package has been split into a modular architecture. For Angular applications using `HttpClient`, migrate to `http-params-processor-angular-http`.

#### 1. Update Package Installation

```bash
# Remove old package
npm uninstall @adaskothebeast/http-params-processor

# Install new packages
npm install @adaskothebeast/http-params-processor-core @adaskothebeast/http-params-processor-angular-http
```

#### 2. Update Imports

```typescript
// Before
import { HttpParamsProcessorService } from '@adaskothebeast/http-params-processor';

// After
import { HttpParamsProcessorService } from '@adaskothebeast/http-params-processor-angular-http';
```

#### 3. Update Module Imports (if using NgModule)

```typescript
// Before
import { HttpParamsProcessorModule } from '@adaskothebeast/http-params-processor';

// After
import { HttpParamsProcessorModule } from '@adaskothebeast/http-params-processor-angular-http';
```

#### 4. Update Injection Tokens

```typescript
// Before
import { 
  HTTP_PARAMS_KEY_FORMATTER, 
  HTTP_PARAMS_VALUE_CONVERTERS 
} from '@adaskothebeast/http-params-processor';

// After
import { 
  HTTP_PARAMS_KEY_FORMATTER, 
  HTTP_PARAMS_VALUE_CONVERTERS 
} from '@adaskothebeast/http-params-processor-angular-http';
```

#### 5. Update Key Formatter Imports (if using custom formatters)

Key formatters are now in separate packages:

```typescript
// Before (if custom strategies were in the main package)
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor';

// After
import { BracketNotationKeyFormattingStrategy } from '@adaskothebeast/http-params-processor-key-bracket-notation';
```

#### 6. Update Value Converter Imports

Value converters are now split into `value-from-*` and `value-to-*` packages:

```typescript
// Before (example with date handling)
// Dates were converted directly

// After - use the two-stage pipeline
import { DayjsDateValueFromStrategy } from '@adaskothebeast/http-params-processor-value-from-dayjs';
import { UnixTimestampValueToStrategy } from '@adaskothebeast/http-params-processor-value-to-unix-timestamp';
import { createValueConverter } from '@adaskothebeast/http-params-processor-angular-http';

const converter = createValueConverter(
  new DayjsDateValueFromStrategy(),
  new UnixTimestampValueToStrategy()
);
```

#### API Compatibility

The `HttpParamsProcessorService` API remains the same:
- `process(key, obj, options?)` - Creates new `HttpParams`
- `processWithParams(params, key, obj, options?)` - Extends existing `HttpParams`

#### Quick Reference: New Package Names

| Old Import | New Package |
|------------|-------------|
| `@adaskothebeast/http-params-processor` | `@adaskothebeast/http-params-processor-angular-http` |
| Key formatters (built-in) | `@adaskothebeast/http-params-processor-key-*` |
| Value converters | `@adaskothebeast/http-params-processor-value-from-*` + `value-to-*` |
| Core types/interfaces | `@adaskothebeast/http-params-processor-core` |

---

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Adam "AdaskoTheBeAsT" Pluciński**
- GitHub: [@AdaskoTheBeAsT](https://github.com/AdaskoTheBeAsT)

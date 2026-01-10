import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { httpResourceWithParams, reactiveHttpResourceWithParams } from './http-resource-with-params';

interface User {
  id: number;
  name: string;
}

describe('httpResourceWithParams', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  it('should create a resource', () => {
    TestBed.runInInjectionContext(() => {
      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          status: 'active',
          count: 10,
        }),
      });

      expect(resource).toBeDefined();
      expect(resource.value).toBeDefined();
      expect(resource.status).toBeDefined();
      expect(resource.isLoading).toBeDefined();
      expect(resource.error).toBeDefined();
      expect(resource.reload).toBeDefined();
    });
  });

  it('should create a resource with nested objects in params', () => {
    TestBed.runInInjectionContext(() => {
      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          user: {
            name: 'John',
            age: 30,
          },
        }),
      });

      expect(resource).toBeDefined();
    });
  });

  it('should create a resource with arrays in params', () => {
    TestBed.runInInjectionContext(() => {
      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          roles: ['admin', 'user'],
        }),
      });

      expect(resource).toBeDefined();
    });
  });

  it('should create a resource with Date objects in params', () => {
    TestBed.runInInjectionContext(() => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          createdAt: date,
        }),
      });

      expect(resource).toBeDefined();
    });
  });

  it('should create a resource with additional static params', () => {
    TestBed.runInInjectionContext(() => {
      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          status: 'active',
        }),
        additionalParams: {
          page: '1',
          size: '10',
        },
      });

      expect(resource).toBeDefined();
    });
  });

  it('should create a resource with custom HTTP method', () => {
    TestBed.runInInjectionContext(() => {
      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          status: 'active',
        }),
        method: 'POST',
        body: { action: 'search' },
      });

      expect(resource).toBeDefined();
    });
  });

  it('should create a resource with custom headers', () => {
    TestBed.runInInjectionContext(() => {
      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          status: 'active',
        }),
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(resource).toBeDefined();
    });
  });

  it('should be idle when url function returns undefined', () => {
    TestBed.runInInjectionContext(() => {
      const urlSignal = signal<string | undefined>(undefined);

      const resource = httpResourceWithParams<User[]>({
        url: () => urlSignal(),
        paramsKey: 'filter',
        paramsValue: () => ({
          status: 'active',
        }),
      });

      expect(resource.status()).toBe('idle');
    });
  });

  it('should be idle when params function returns undefined', () => {
    TestBed.runInInjectionContext(() => {
      const paramsSignal = signal<Record<string, unknown> | undefined>(undefined);

      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => paramsSignal(),
      });

      expect(resource.status()).toBe('idle');
    });
  });

  it('should create a resource with default value', () => {
    TestBed.runInInjectionContext(() => {
      const defaultUsers: User[] = [];

      const resource = httpResourceWithParams<User[]>({
        url: '/api/users',
        paramsKey: 'filter',
        paramsValue: () => ({
          status: 'active',
        }),
        defaultValue: defaultUsers,
      });

      expect(resource).toBeDefined();
    });
  });
});

describe('reactiveHttpResourceWithParams', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  it('should create a reactive resource', () => {
    TestBed.runInInjectionContext(() => {
      const statusFilter = signal('active');

      const resource = reactiveHttpResourceWithParams<User[], { status: string }>({
        url: '/api/users',
        paramsKey: 'filter',
        params: () => ({
          status: statusFilter(),
        }),
      });

      expect(resource).toBeDefined();
      expect(resource.value).toBeDefined();
      expect(resource.status).toBeDefined();
    });
  });

  it('should create a reactive resource with default value', () => {
    TestBed.runInInjectionContext(() => {
      const statusFilter = signal('active');
      const defaultUsers: User[] = [];

      const resource = reactiveHttpResourceWithParams<User[], { status: string }>({
        url: '/api/users',
        paramsKey: 'filter',
        params: () => ({
          status: statusFilter(),
        }),
        defaultValue: defaultUsers,
      });

      expect(resource).toBeDefined();
    });
  });
});

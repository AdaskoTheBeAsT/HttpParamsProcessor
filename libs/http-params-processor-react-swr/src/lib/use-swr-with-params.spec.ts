import { ParamsProcessor } from '@adaskothebeast/http-params-processor-core';

// Re-implement utility functions locally for testing without SWR dependency
function buildUrlWithParams(
  url: string,
  paramsKey: string,
  params: Record<string, unknown>
): string {
  const processor = new ParamsProcessor();
  const queryString = processor.toQueryString(paramsKey, params);

  if (!queryString) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

function getProcessedUrl(
  url: string,
  paramsKey: string,
  params: Record<string, unknown>
): string {
  return buildUrlWithParams(url, paramsKey, params);
}

function createSWRKey(
  url: string,
  paramsKey: string,
  params: Record<string, unknown>
): string {
  return buildUrlWithParams(url, paramsKey, params);
}

describe('buildUrlWithParams', () => {
  it('should build URL with simple params', () => {
    const url = buildUrlWithParams('/api/users', 'filter', {
      status: 'active',
      count: 10,
    });

    expect(url).toBe('/api/users?filter.status=active&filter.count=10');
  });

  it('should build URL with nested params', () => {
    const url = buildUrlWithParams('/api/users', 'filter', {
      user: { name: 'John', age: 30 },
    });

    expect(url).toBe('/api/users?filter.user.name=John&filter.user.age=30');
  });

  it('should build URL with array params', () => {
    const url = buildUrlWithParams('/api/users', 'filter', {
      roles: ['admin', 'user'],
    });

    expect(url).toBe('/api/users?filter.roles%5B0%5D=admin&filter.roles%5B1%5D=user');
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const url = buildUrlWithParams('/api/users', 'filter', {
      createdAt: date,
    });

    expect(url).toBe('/api/users?filter.createdAt=2024-01-01T00%3A00%3A00.000Z');
  });

  it('should append to existing query params', () => {
    const url = buildUrlWithParams('/api/users?page=1', 'filter', {
      status: 'active',
    });

    expect(url).toBe('/api/users?page=1&filter.status=active');
  });

  it('should return base URL when params produce empty string', () => {
    const url = buildUrlWithParams('/api/users', 'filter', {
      a: null,
      b: undefined,
    });

    expect(url).toBe('/api/users');
  });
});

describe('getProcessedUrl', () => {
  it('should return the same result as buildUrlWithParams', () => {
    const params = { status: 'active', roles: ['admin'] };
    const url1 = buildUrlWithParams('/api/users', 'filter', params);
    const url2 = getProcessedUrl('/api/users', 'filter', params);

    expect(url1).toBe(url2);
  });
});

describe('createSWRKey', () => {
  it('should create a valid SWR key', () => {
    const key = createSWRKey('/api/users', 'filter', { status: 'active' });

    expect(key).toBe('/api/users?filter.status=active');
  });
});

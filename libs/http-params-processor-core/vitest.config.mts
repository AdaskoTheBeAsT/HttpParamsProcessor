import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

const project = 'libs/http-params-processor-core';
const reportPath = `../../.reports/${project}/`;

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/http-params-processor-core',
  test: {
    name: '@adaskothebeast/http-params-processor-core',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: [
      'default',
      ['html', { outputFile: `${reportPath}html/index.html` }],
      ['junit', { outputFile: `${reportPath}report.junit.xml` }],
      [
        'vitest-sonar-reporter',
        {
          outputFile: `${reportPath}report.sonar.xml`,
          onWritePath(reportPath: string) {
            // Prefix all paths with root directory
            // e.g. '<file path="test/math.ts">' to '<file path="frontend/test/math.ts">'
            return path.relative('.', reportPath);
          },
        },
      ],
    ],
    coverage: {
      reportsDirectory: `${reportPath}html/coverage`,
      provider: 'v8' as const,
      enabled: true,
      reporter: ['lcov', 'cobertura', 'html', 'text-summary'],
      all: true,
    },
    cacheDir: '../../node_modules/.vitest'
  }
}));

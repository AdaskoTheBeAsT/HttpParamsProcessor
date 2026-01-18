import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

const project = 'libs/http-params-processor-axios';
const reportPath = `../../.reports/${project}/`;

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/http-params-processor-axios',
  resolve: {
    alias: {
      '@adaskothebeast/http-params-processor-core': path.resolve(__dirname, '../http-params-processor-core/src/index.ts'),
    },
  },
  test: {
    name: '@adaskothebeast/http-params-processor-axios',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: [
      'default',
      ['html', { outputFile: `${reportPath}html/index.html` }],
      ['junit', { outputFile: `${reportPath}test-report.junit.xml` }],
      [
        'vitest-sonar-reporter',
        {
          outputFile: `${reportPath}test-report.sonar.xml`,
          onWritePath(reportPath: string) {
            return path.relative('.', reportPath);
          },
        },
      ],
    ],
    coverage: {
      reportsDirectory: `${reportPath}coverage`,
      provider: 'v8' as const,
      enabled: true,
      reporter: ['lcov', 'cobertura', 'html', 'text-summary'],
      all: true,
    },
    cacheDir: '../../node_modules/.vitest'
  }
}));

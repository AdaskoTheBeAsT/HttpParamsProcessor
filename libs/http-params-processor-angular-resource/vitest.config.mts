import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

const project = 'libs/http-params-processor-angular-resource';
const reportPath = `.reports/${project}/`;

export default defineConfig(() => ({
  cacheDir: 'node_modules/.vite/libs/http-params-processor-angular-resource',
  test: {
    name: 'http-params-processor-angular-resource',
    watch: false,
    globals: true,
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
    cacheDir: 'node_modules/.vitest'
  }
}));

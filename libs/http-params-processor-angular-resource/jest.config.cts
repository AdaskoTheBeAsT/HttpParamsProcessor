const reportPath = '.reports/libs/http-params-processor-angular-resource/';
const reportName = 'test-report';

module.exports = {
  displayName: 'http-params-processor-angular-resource',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  collectCoverage: true,
  coverageDirectory: `../../${reportPath}coverage`,
  coverageReporters: ['cobertura', 'html', 'lcov'],
  reporters: [
    'default',
    [
      'jest-stare',
      {
        resultDir: reportPath,
        reportTitle: 'Frontend test',
        additionalResultsProcessors: [],
        coverageLink: 'coverage/index.html',
        resultJson: `${reportName}.stare.json`,
        resultHtml: `${reportName}.stare.html`,
        report: true,
        reportSummary: true,
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: reportPath,
        filename: `${reportName}.html`,
        pageTitle: 'Frontend test',
        expand: true,
      },
    ],
    [
      'jest-xunit',
      {
        outputPath: reportPath,
        filename: `${reportName}.xunit.xml`,
        traitsRegex: [
          { regex: /\(Test Type:([^,)]+)[,)].*/g, name: 'Category' },
          { regex: /.*Test Traits: ([^)]+)\).*/g, name: 'Type' },
        ],
      },
    ],
    [
      'jest-sonar',
      {
        outputDirectory: reportPath,
        outputName: `${reportName}.sonar.xml`,
        reportedFilePath: 'relative',
        relativeRootDir: './',
      },
    ],
    [
      'jest-trx-results-processor',
      {
        outputFile: `${reportPath}${reportName}.trx`,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: reportPath,
        outputName: `${reportName}.junit.xml`,
      },
    ],
  ],
};

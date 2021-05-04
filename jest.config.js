module.exports = {
  projects: ['<rootDir>/apps/sample', '<rootDir>/libs/http-params-processor'],
  coverageReporters: ['lcov', 'text'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/out-tsc/',
    '<rootDir>/jest/',
    '.*.html',
    '.*.spec.ts',
    '<rootDir>/src/(setup-jest|jest-global-mocks|global-mocks).ts',
  ],
  coverageDirectory: './.artifacts/tscoverage',
  testResultsProcessor: './resultsProcessor',
  reporters: [
    'default',
    [
      'jest-stare',
      {
        resultDir: './.artifacts/frontendunittest/',
        reportTitle: 'Frontend test',
        additionalResultsProcessors: [],
        coverageLink: '../tscoverage/lcov-report/index.html',
        resultJson: 'frontend.stare.json',
        resultHtml: 'frontend.stare.html',
        report: true,
        reportSummary: true,
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './.artifacts/frontendunittest/',
        filename: 'frontend-test-report.html',
        pageTitle: 'Frontend test',
        expand: true,
      },
    ],
    [
      'jest-xunit',
      {
        outputPath: './.artifacts/frontendunittest/',
        filename: 'frontend-test-report.xunit.xml',
        traitsRegex: [
          { regex: /\(Test Type:([^,)]+)(,|\)).*/g, name: 'Category' },
          { regex: /.*Test Traits: ([^)]+)\).*/g, name: 'Type' },
        ],
      },
    ],
    [
      'jest-sonar',
      {
        outputDirectory: './.artifacts/frontendunittest/',
        outputName: 'frontend-test.sonar.xml',
      },
    ],
    [
      'jest-trx-results-processor',
      {
        outputFile: './.artifacts/frontendunittest/frontend-test.sonar.trx',
      },
    ],
  ],
};

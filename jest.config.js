const {
  pathsToModuleNameMapper
} = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const {
  compilerOptions
} = require('./tsconfig');

const jestConfig = {
  preset: 'jest-preset-angular',
  testURL: 'http://localhost', // https://github.com/facebook/jest/issues/6766
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  coverageReporters: ['lcov', 'text'],
  testMatch: [
    '<rootDir>/**/*(*.)@(spec|test).[tj]s?(x)',
  ],
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
  //   prefix: '<rootDir>/src/'
  // }),
  // moduleNameMapper: {
  //   '^src/(.*)': '<rootDir>/src/$1',
  //   //'assets/(.*)': '<rootDir>/src/assets/$1',
  //   //'environments/(.*)': '<rootDir>/src/environments/$1',
  // },
  // //   transformIgnorePatterns: ['node_modules/(?!@ngrx)'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
      '<rootDir>/out-tsc/',
      '<rootDir>/jest/',
      '.*\.html',
      '.*\.spec\.ts',
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
        additionalResultsProcessors: [
        ],
        coverageLink: '../tscoverage/lcov-report/index.html',
        resultJson: 'frontend.stare.json',
        resultHtml: 'frontend.stare.html',
        report: true,
        reportSummary: true,
      }
    ],
    ['jest-html-reporters', {
      publicPath: './.artifacts/frontendunittest/',
      filename: 'frontend-test-report.html',
      pageTitle:'Frontend test',
      expand: true
    }],
    ['jest-xunit', {
      outputPath: './.artifacts/frontendunittest/',
      filename: 'frontend-test-report.xunit.xml',
      traitsRegex: [
        { regex: /\(Test Type:([^,)]+)(,|\)).*/g, name: 'Category' },
        { regex: /.*Test Traits: ([^)]+)\).*/g, name: 'Type' }
      ]
    }],
    ['jest-sonar', {
      outputDirectory: './.artifacts/frontendunittest/',
      outputName: 'frontend-test.sonar.xml'
    }],
    [
      'jest-trx-results-processor',
      {
        outputFile: './.artifacts/frontendunittest/frontend-test.sonar.trx',
      }
    ],
  ]
};

module.exports = jestConfig;

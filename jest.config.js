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
    '<rootDir>/**/*(*.)@(spec|test).[tj]s?(x)',
    'src/(setup-jest|jest-global-mocks).ts',
  ],
  coverageDirectory: './.artifacts/tscoverage',
  testResultsProcessor: './resultsProcessor',
};

module.exports = jestConfig;

const PACKAGE = require('../../package.json');

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/config/',
    '<rootDir>/flow-typed/',
  ],
  coverageDirectory: '<rootDir>/coverage',
  globals: {
    __AUTH0_CLIENT_ID__: 'not_set',
    __AUTH0_DOMAIN__: 'not_set',
    __ENV_DEV__: false,
    __ENV_PROD__: false,
    __ENV_TEST__: true,
    __PACKAGE__: PACKAGE.name,
    __VERSION__: PACKAGE.version,
  },
  modulePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/flow-typed/',
  ],
  rootDir: '../..',
  setupFiles: [
    // '<rootDir>/config/jest/polyfill.rAF.js',
    '<rootDir>/config/jest/enzyme.config.js',
  ],
  testEnvironment: '<rootDir>/config/jest/jsdom.config.js',
  testURL: 'http://localhost/',
};

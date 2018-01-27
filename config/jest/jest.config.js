module.exports = {
  globals: {
    __AUTH0_CLIENT_ID__: 'not_set',
    __AUTH0_DOMAIN__: 'not_set'
  },
  rootDir: '../..',
  setupFiles: [
    '<rootDir>/config/jest/polyfill.rAF.js',
    '<rootDir>/config/jest/enzyme.config.js'
  ]
};

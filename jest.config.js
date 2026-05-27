module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/firebase-public-config.js',
    '!js/cloud.js',
    '!js/monetization.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
};

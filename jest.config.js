module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['text', 'lcov'],
  testPathIgnorePatterns: ['build']
};

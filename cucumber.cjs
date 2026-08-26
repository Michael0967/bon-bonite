const shared = {
  import: ['src/**/*.ts'],
  format: ['summary', 'json:test-results/cucumber.json'],
  formatOptions: { snippetInterface: 'async-await' },
};

module.exports = {
  default: {
    ...shared,
    retry: 2,
    parallel: 2,
  },
  'no-retry': {
    ...shared,
    retry: 0,
    parallel: 2,
  },
  single: {
    ...shared,
    retry: 0,
    parallel: 1,
  },
};

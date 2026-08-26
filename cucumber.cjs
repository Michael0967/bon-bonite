module.exports = {
  default: {
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 2,
    parallel: 2,
  },
  chrome: {
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 0,
    parallel: 2,
  },
  parallel: {
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 2,
    parallel: 2,
  },
  'chrome-parallel': {
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 2,
    parallel: 2,
  },
  sequential: {
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 1,
    parallel: 0,
  },
};

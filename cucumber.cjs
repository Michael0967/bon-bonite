module.exports = {
  default: {
    paths: ['features'],
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 1,
  },
  parallel: {
    paths: ['features'],
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 1,
    parallel: 3,
  },
};

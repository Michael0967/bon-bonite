module.exports = {
  default: {
    paths: ['features'],
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 0,
  },
};

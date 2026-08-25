const { cpus } = require('os');
const workers = Math.max(1, cpus().length - 1);

module.exports = {
  default: {
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 1,
    parallel: workers,
  },
  parallel: {
    import: ['dist/**/*.js'],
    format: ['summary', 'json:test-results/cucumber.json'],
    formatOptions: { snippetInterface: 'async-await' },
    retry: 1,
    parallel: workers,
  },
};

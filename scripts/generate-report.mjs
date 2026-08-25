import { generate } from 'multiple-cucumber-html-reporter';

generate({
  jsonDir: 'test-results',
  reportPath: 'test-results/html',
  openReportInBrowser: true,
  pageTitle: 'Bon-Bonite E2E Automation',
  metadata: {
    browser: { name: 'chromium', version: '---' },
    platform: { name: process.platform },
  },
  customData: {
    title: 'Run info',
    data: [
      { label: 'Project', value: 'Technical Test - Bon-Bonite' },
      { label: 'Environment', value: 'https://www.bon-bonite.com (production)' },
      { label: 'Execution', value: new Date().toLocaleString() },
    ],
  },
});

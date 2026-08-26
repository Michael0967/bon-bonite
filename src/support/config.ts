const ENGINES = ['chromium', 'firefox', 'webkit'] as const;

export type Engine = (typeof ENGINES)[number];

function resolveEngine(): Engine {
  const raw = process.env.BB_BROWSER ?? '';
  return (ENGINES as readonly string[]).includes(raw) ? (raw as Engine) : 'chromium';
}

function resolveHeadless(): boolean {
  if (process.env.CI === 'true') return true;
  return process.env.BB_HEADLESS !== 'false';
}

const REQUIRED_VARS = ['BB_TEST_PASSWORD', 'BB_EXISTING_EMAIL', 'BB_EXISTING_ID_NUMBER'] as const;

function validateConfig(): void {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables in .env:\n   ${missing.join('\n   ')}\n`);
    process.exit(1);
  }
}

validateConfig();

export const config = {
  baseUrl: process.env.BB_BASE_URL ?? 'https://www.bon-bonite.com',
  testPassword: process.env.BB_TEST_PASSWORD ?? '',
  newPassword: process.env.BB_NEW_PASSWORD ?? '',
  existingEmail: process.env.BB_EXISTING_EMAIL ?? '',
  hackedEmail: process.env.BB_HACKED_EMAIL ?? '',
  existingIdNumber: process.env.BB_EXISTING_ID_NUMBER ?? '',
  billing: {
    firstName: process.env.BB_BILLING_FIRST_NAME ?? '',
    lastName: process.env.BB_BILLING_LAST_NAME ?? '',
    phone: process.env.BB_BILLING_PHONE ?? '',
    address1: process.env.BB_BILLING_ADDRESS_1 ?? '',
    city: process.env.BB_BILLING_CITY ?? '',
  },
  shipping: {
    firstName: process.env.BB_SHIPPING_FIRST_NAME ?? '',
    lastName: process.env.BB_SHIPPING_LAST_NAME ?? '',
    address1: process.env.BB_SHIPPING_ADDRESS_1 ?? '',
    city: process.env.BB_SHIPPING_CITY ?? '',
  },
  browser: resolveEngine(),
  headless: resolveHeadless(),
  viewport: { width: 1280, height: 720 },
  stepTimeout: 60_000,
  actionTimeout: 15_000,
  navigationTimeout: 45_000,
  expectTimeout: 10_000,
  trace: process.env.BB_TRACE === 'on',
};

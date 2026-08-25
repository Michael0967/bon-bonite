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

export const config = {
  baseUrl: process.env.BB_BASE_URL ?? 'https://www.bon-bonite.com',
  testPassword: process.env.BB_TEST_PASSWORD ?? '',
  browser: resolveEngine(),
  headless: resolveHeadless(),
  viewport: { width: 1280, height: 720 },
  stepTimeout: 60_000,
  actionTimeout: 15_000,
  navigationTimeout: 45_000,
  expectTimeout: 10_000,
  trace: process.env.BB_TRACE === 'on',
};

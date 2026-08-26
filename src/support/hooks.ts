import {
  After,
  AfterAll,
  Before,
  setDefaultTimeout,
  Status,
} from '@cucumber/cucumber';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { closeBrowser, getBrowser } from './browser';
import { config } from './config';
import { loadSessionCookies, saveSessionCookies } from './session';
import { getRandomUserAgent } from './user-agent';
import { report403 } from './circuit-breaker';
import type { BonboniteWorld } from './world';
import type { Response } from '@playwright/test';

setDefaultTimeout(config.stepTimeout);

const cookieConsentValue = JSON.stringify({
  googleconsentmap: {
    ad_storage: 'targeting',
    analytics_storage: 'performance',
    ad_personalization: 'targeting',
    ad_user_data: 'targeting',
    functionality_storage: 'functionality',
    personalization_storage: 'functionality',
    security_storage: 'functionality',
  },
  action: 'accept',
  consenttime: 1725894639,
  categories: '["unclassified","targeting","performance","functionality"]',
});

const ANTI_DETECT_SCRIPTS = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'languages', { get: () => ['es-CO', 'es', 'en-US', 'en'] });
  Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
  Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  window.chrome = { runtime: {} };
  Object.defineProperty(navigator, 'plugins', {
    get: () => [
      { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
      { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
      { name: 'Native Client', filename: 'internal-nacl-plugin' },
    ],
  });
`;

Before(async function (this: BonboniteWorld): Promise<void> {
  const browser = await getBrowser();
  const userAgent = getRandomUserAgent();

  this.context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport: config.viewport,
    userAgent,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    extraHTTPHeaders: {
      'Accept-Language': 'es-CO,es;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="120", "Chromium";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    },
  });

  await this.context.addInitScript(ANTI_DETECT_SCRIPTS);

  const hasCookies = await loadSessionCookies(this.context);

  await this.context.addCookies([
    {
      name: 'CookieScriptConsent',
      value: cookieConsentValue,
      domain: new URL(config.baseUrl).hostname,
      path: '/',
      secure: true,
      sameSite: 'Lax',
    },
  ]);

  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.actionTimeout);
  this.page.setDefaultNavigationTimeout(config.navigationTimeout);

  this.page.on('response', (response: Response) => {
    if (response.status() === 403 && response.request().isNavigationRequest()) {
      report403();
    }
  });

  this.userData.hasSessionCookies = hasCookies;

  if (config.trace) {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: false });
    this.tracingActive = true;
  }
});

After(async function (this: BonboniteWorld, { result }): Promise<void> {
  const failed = result?.status === Status.FAILED;
  try {
    if (this.page) {
      await saveSessionCookies(this.context);
    }
    if (failed && this.page) {
      await this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
    }
    if (this.tracingActive && this.context) {
      const dir = join('test-results', 'traces');
      mkdirSync(dir, { recursive: true });
      const path = join(dir, `trace-${Date.now()}.zip`);
      await this.context.tracing.stop({ path });
      if (failed) {
        await this.attach(
          `Trace: ${path} (view with: npx playwright show-trace ${path})`,
          'text/plain',
        );
      }
    }
  } finally {
    await this.context?.close();
  }
});

AfterAll(async function (): Promise<void> {
  await closeBrowser();
});

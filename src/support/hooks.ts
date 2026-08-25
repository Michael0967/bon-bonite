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
import type { BonboniteWorld } from './world';

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

Before(async function (this: BonboniteWorld): Promise<void> {
  const browser = await getBrowser();
  this.context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport: config.viewport,
  });
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

  if (config.trace) {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: false });
    this.tracingActive = true;
  }
});

After(async function (this: BonboniteWorld, { result }): Promise<void> {
  const failed = result?.status === Status.FAILED;
  try {
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

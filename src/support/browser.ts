import { chromium as pwChromium, firefox as pwFirefox, webkit as pwWebkit } from '@playwright/test';
import { addExtra } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from './config';
import type { Browser } from '@playwright/test';

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('iframe.contentWindow');
stealth.enabledEvasions.delete('navigator.plugins');

let cached: Promise<Browser> | undefined;

export function getBrowser(): Promise<Browser> {
  cached ??= launch();
  return cached;
}

function launch(): Promise<Browser> {
  const engines: Record<string, typeof pwChromium> = {
    chromium: pwChromium,
    firefox: pwFirefox,
    webkit: pwWebkit,
  };

  const rawLauncher = engines[config.browser];
  const augmented = addExtra(rawLauncher);
  augmented.use(stealth);

  return augmented.launch({
    headless: config.headless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
    ],
  }) as Promise<Browser>;
}

export async function closeBrowser(): Promise<void> {
  if (!cached) return;
  const browser = await cached;
  cached = undefined;
  await browser.close();
}

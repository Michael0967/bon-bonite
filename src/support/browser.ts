import { chromium, firefox, webkit, type Browser } from '@playwright/test';
import { config } from './config';

let cached: Promise<Browser> | undefined;

export function getBrowser(): Promise<Browser> {
  cached ??= launch();
  return cached;
}

function launch(): Promise<Browser> {
  const engines = { chromium, firefox, webkit };
  return engines[config.browser].launch({ headless: config.headless });
}

export async function closeBrowser(): Promise<void> {
  if (!cached) return;
  const browser = await cached;
  cached = undefined;
  await browser.close();
}

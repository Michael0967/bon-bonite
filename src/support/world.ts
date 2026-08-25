import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';

export class BonboniteWorld extends World {
  context!: BrowserContext;
  page!: Page;
  tracingActive = false;
  userData: Record<string, unknown> = {};
}

setWorldConstructor(BonboniteWorld);

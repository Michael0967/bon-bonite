import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick, humanType } from '../support/humanize';
import { waitForCooldown, report403 } from '../support/circuit-breaker';
import { throttleNavigation } from '../support/rate-limiter';

const SELECTORS = {
  usernameInput: '#username',
  passwordInput: '#password',
  rememberMeCheckbox: '#rememberme',
  loginButton: 'button[name="login"]',
  errorMessage: '.woocommerce-error',
} as const;

const TEXT = {
  accountNavigation: 'Páginas de cuenta',
} as const;

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  private readonly submitButton: Locator;

  readonly errorMessage: Locator;
  readonly accountNavigation: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator(SELECTORS.usernameInput);
    this.passwordInput = page.locator(SELECTORS.passwordInput);
    this.rememberMeCheckbox = page.locator(SELECTORS.rememberMeCheckbox);
    this.submitButton = page.locator(SELECTORS.loginButton);

    this.errorMessage = page.locator(SELECTORS.errorMessage);
    this.accountNavigation = page.getByRole('navigation', { name: TEXT.accountNavigation });
  }

  greeting(firstName: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(`Hola,\\s*${firstName}\\.`) });
  }

  async open(): Promise<void> {
    const maxAttempts = 5;
    let lastStatus: number | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      const response =
        attempt === 1
          ? await this.page.goto('/mi-cuenta/')
          : await this.page.reload({ waitUntil: 'load' });
      lastStatus = response?.status();

      if (lastStatus === 403) {
        report403();
        await waitForCooldown();
        continue;
      }

      const formReady = await this.usernameInput
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (formReady) return;
      await humanDelay(5_000 * attempt, 8_000 * attempt);
    }
    throw new Error(
      `/mi-cuenta/ did not load correctly after ${maxAttempts} attempts (last HTTP status: ${lastStatus ?? 'unknown'}). The site WAF may be rate limiting this IP.`,
    );
  }

  async validationMessageFor(field: 'username' | 'password'): Promise<string> {
    const target = field === 'username' ? this.usernameInput : this.passwordInput;
    return target.evaluate((node) => (node as HTMLInputElement).validationMessage);
  }

  async fillCredentials(idNumber: string, password: string): Promise<void> {
    await this.usernameInput.fill('');
    await humanDelay(500, 1_000);
    await humanType(this.usernameInput, idNumber);
    await humanDelay(1_500, 3_000);
    await this.passwordInput.fill('');
    await humanDelay(500, 1_000);
    await humanType(this.passwordInput, password);
    await humanDelay(1_000, 2_500);
  }

  async submit(): Promise<void> {
    await humanClick(this.submitButton);
    const outcomeSettled = await Promise.race([
      this.errorMessage.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
      this.accountNavigation.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
    ]).catch(() => false);

    if (!outcomeSettled) {
      await humanDelay(3_000, 5_000);
      await humanClick(this.submitButton);
    }
  }
}

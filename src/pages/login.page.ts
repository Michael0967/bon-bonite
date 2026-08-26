import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick, humanType } from '../support/humanize';
import { report403, reportSuccess, waitForCooldown } from '../support/circuit-breaker';
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
    await waitForCooldown();
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      let status = 0;
      try {
        const response =
          attempt === 1
            ? await this.page.goto('/mi-cuenta/', { waitUntil: 'domcontentloaded', timeout: 15_000 })
            : await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 15_000 });
        status = response?.status() ?? 0;
      } catch {
        status = 0;
      }

      if (status === 403) {
        report403();
        await humanDelay(3_000, 5_000);
        continue;
      }

      const formReady = await this.usernameInput
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (formReady) {
        reportSuccess();
        return;
      }
      await humanDelay(1_000 * attempt, 2_000 * attempt);
    }
    throw new Error(
      `/mi-cuenta/ did not load correctly after ${maxAttempts} attempts. The site WAF may be rate limiting this IP.`,
    );
  }

  async hasAuthCookies(): Promise<boolean> {
    const cookies = await this.page.context().cookies();
    const authPatterns = ['wordpress_logged_in', 'wordpress_sec', 'wp_woocommerce_session'];
    return cookies.some((c) => authPatterns.some((p) => c.name.startsWith(p)));
  }

  async clearAuthCookies(): Promise<void> {
    const context = this.page.context();
    const cookies = await context.cookies();
    const authPatterns = ['wordpress_logged_in', 'wordpress_sec', 'wp_woocommerce_session'];
    const authCookies = cookies.filter((c) =>
      authPatterns.some((p) => c.name.startsWith(p)),
    );
    for (const cookie of authCookies) {
      await context.clearCookies({
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
      });
    }
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

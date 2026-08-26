import type { Locator, Page } from '@playwright/test';
import type { RegistrationData } from '../support/user';
import { report403 } from '../support/circuit-breaker';
import { throttleNavigation } from '../support/rate-limiter';
import { humanDelay } from '../support/humanize';

export type FieldKey =
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'confirmPassword';

export type MandatoryField = FieldKey | 'privacy';

const SELECTORS = {
  form: '#form-register',
  showRegisterToggle: '#show_register',
  usernameInput: '#reg_username',
  firstNameInput: '#first_name',
  lastNameInput: '#last_name',
  emailInput: '#reg_email',
  passwordInput: '#reg_password',
  confirmPasswordInput: '#reg_password2',
  privacyPolicyCheckbox: '#privacy_policy_reg',
  errorMessage: '.woocommerce-error',
} as const;

const TEXT = {
  submitButton: 'Registrarme',
  accountNavigation: 'Páginas de cuenta',
  shortPasswordWarning: 'La contraseña debe tener al menos 8 caracteres.',
} as const;

export class RegisterPage {
  private readonly showRegisterToggle: Locator;
  private readonly fields: Record<FieldKey, Locator>;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly submitButton: Locator;

  readonly form: Locator;
  readonly accountNavigation: Locator;
  readonly errorMessage: Locator;
  readonly shortPasswordWarning: Locator;

  constructor(private readonly page: Page) {
    this.showRegisterToggle = page.locator(SELECTORS.showRegisterToggle);
    this.fields = {
      username: page.locator(SELECTORS.usernameInput),
      firstName: page.locator(SELECTORS.firstNameInput),
      lastName: page.locator(SELECTORS.lastNameInput),
      email: page.locator(SELECTORS.emailInput),
      password: page.locator(SELECTORS.passwordInput),
      confirmPassword: page.locator(SELECTORS.confirmPasswordInput),
    };
    this.privacyPolicyCheckbox = page.locator(SELECTORS.privacyPolicyCheckbox);
    this.submitButton = page.getByRole('button', { name: TEXT.submitButton });

    this.form = page.locator(SELECTORS.form);
    this.accountNavigation = page.getByRole('navigation', { name: TEXT.accountNavigation });
    this.errorMessage = page.locator(SELECTORS.errorMessage);
    this.shortPasswordWarning = page.getByText(TEXT.shortPasswordWarning);
  }

  greeting(firstName: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(`Hola,\\s*${firstName}\\.`) });
  }

  async validationMessageFor(field: MandatoryField): Promise<string> {
    const target = field === 'privacy' ? this.privacyPolicyCheckbox : this.fields[field];
    return target.evaluate((node) => (node as HTMLInputElement).validationMessage);
  }

  async open(): Promise<void> {
    const maxAttempts = 5;
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
        await humanDelay(10_000, 20_000);
        continue;
      }

      const formAppeared = await this.showRegisterToggle
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (formAppeared) return;
      await humanDelay(5_000 * attempt, 8_000 * attempt);
    }
    throw new Error(
      `/mi-cuenta/ did not load correctly after ${maxAttempts} attempts. The site WAF may be rate limiting this IP.`,
    );
  }

  async revealForm(): Promise<void> {
    await this.showRegisterToggle.click();
    await this.fields.username.waitFor({ state: 'visible' });
  }

  async fill(
    fields: Partial<Record<FieldKey, string>> = {},
    options: { acceptPrivacy?: boolean } = {},
  ): Promise<void> {
    for (const [key, value] of Object.entries(fields)) {
      await this.fields[key as FieldKey].fill('');
      await new Promise((r) => setTimeout(r, 300));
      await this.fields[key as FieldKey].fill(value ?? '');
    }
    if (options.acceptPrivacy !== false) {
      await this.privacyPolicyCheckbox.check();
    }
  }

  async submit(): Promise<void> {
    const pendingNativeValidation = await this.form.locator('input:invalid').count();
    if (pendingNativeValidation > 0) return;

    await this.submitButton.click();
    const outcomeSettled = await Promise.race([
      this.errorMessage.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
      this.shortPasswordWarning.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
      this.accountNavigation.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true),
    ]).catch(() => false);

    if (!outcomeSettled) {
      await humanDelay(3_000, 5_000);
      await this.submitButton.click();
    }
  }
}

import type { Locator, Page } from '@playwright/test';
import type { RegistrationData } from '../support/user';

const SELECTORS = {
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

const ACCESSIBLE_NAMES = {
  submitButton: 'Registrarme',
  accountNavigation: 'Páginas de cuenta',
} as const;

export class RegisterPage {
  private readonly showRegisterToggle: Locator;
  private readonly usernameInput: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly submitButton: Locator;

  readonly accountNavigation: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.showRegisterToggle = page.locator(SELECTORS.showRegisterToggle);
    this.usernameInput = page.locator(SELECTORS.usernameInput);
    this.firstNameInput = page.locator(SELECTORS.firstNameInput);
    this.lastNameInput = page.locator(SELECTORS.lastNameInput);
    this.emailInput = page.locator(SELECTORS.emailInput);
    this.passwordInput = page.locator(SELECTORS.passwordInput);
    this.confirmPasswordInput = page.locator(SELECTORS.confirmPasswordInput);
    this.privacyPolicyCheckbox = page.locator(SELECTORS.privacyPolicyCheckbox);
    this.submitButton = page.getByRole('button', { name: ACCESSIBLE_NAMES.submitButton });

    this.accountNavigation = page.getByRole('navigation', {
      name: ACCESSIBLE_NAMES.accountNavigation,
    });
    this.errorMessage = page.locator(SELECTORS.errorMessage);
  }

  greeting(firstName: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(`Hola,\\s*${firstName}\\.`) });
  }

  async open(): Promise<void> {
    await this.page.goto('/mi-cuenta/');
  }

  async revealForm(): Promise<void> {
    await this.showRegisterToggle.click();
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async fill(data: RegistrationData): Promise<void> {
    await this.usernameInput.fill(data.username);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
    await this.privacyPolicyCheckbox.check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

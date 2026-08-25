import type { Locator, Page } from '@playwright/test';

const SELECTORS = {
  firstNameInput: '[name="first_name"]',
  lastNameInput: '[name="last_name"]',
  birthDateInput: '[name="birth_date"]',
  auxEmailInput: '[name="aux_email"]',
  genderSelect: '[name="gender"]',
  phoneInput: '[name="billing_phone"]',
  updateInfoButton: 'button.update-info-btn',
  saveInfoButton: 'button.save-info-btn',
  profileMessage: '#profile-message',
  updatePasswordButton: 'button.update-password-btn',
  savePasswordButton: 'button.save-password-btn',
  currentPasswordInput: '#current_password',
  newPasswordInput: '#new_password',
  confirmPasswordInput: '#confirm_password',
  passwordForm: '#password-form',
  passwordMessage: '#password-message',
  passwordMessageText: '#password-message-text',
} as const;

const TEXT = {
  successMessage: 'Datos personales actualizados correctamente',
  accountNavigation: 'Páginas de cuenta',
} as const;

export type ProfileField = 'firstName' | 'lastName' | 'birthDate' | 'email' | 'gender' | 'phone';

export class EditAccountPage {
  readonly updateInfoButton: Locator;
  readonly saveInfoButton: Locator;
  readonly profileMessage: Locator;
  readonly accountNavigation: Locator;
  readonly updatePasswordButton: Locator;
  readonly savePasswordButton: Locator;
  readonly passwordForm: Locator;
  readonly passwordMessage: Locator;

  private readonly fields: Record<ProfileField, Locator>;
  private readonly currentPasswordInput: Locator;
  private readonly newPasswordInput: Locator;
  private readonly confirmPasswordInput: Locator;

  constructor(private readonly page: Page) {
    this.updateInfoButton = page.locator(SELECTORS.updateInfoButton).first();
    this.saveInfoButton = page.locator(SELECTORS.saveInfoButton).first();
    this.profileMessage = page.locator(SELECTORS.profileMessage);
    this.accountNavigation = page.getByRole('navigation', { name: TEXT.accountNavigation });
    this.updatePasswordButton = page.locator(SELECTORS.updatePasswordButton).first();
    this.savePasswordButton = page.locator(SELECTORS.savePasswordButton).first();
    this.passwordForm = page.locator(SELECTORS.passwordForm);
    this.passwordMessage = page.locator(SELECTORS.passwordMessage);

    this.fields = {
      firstName: page.locator(SELECTORS.firstNameInput),
      lastName: page.locator(SELECTORS.lastNameInput),
      birthDate: page.locator(SELECTORS.birthDateInput),
      email: page.locator(SELECTORS.auxEmailInput),
      gender: page.locator(SELECTORS.genderSelect),
      phone: page.locator(SELECTORS.phoneInput),
    };

    this.currentPasswordInput = page.locator(SELECTORS.currentPasswordInput);
    this.newPasswordInput = page.locator(SELECTORS.newPasswordInput);
    this.confirmPasswordInput = page.locator(SELECTORS.confirmPasswordInput);
  }

  async open(): Promise<void> {
    const maxAttempts = 3;
    let lastStatus: number | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response =
        attempt === 1
          ? await this.page.goto('/mi-cuenta/edit-account/')
          : await this.page.reload({ waitUntil: 'load' });
      lastStatus = response?.status();
      const formReady = await this.updateInfoButton
        .waitFor({ state: 'visible', timeout: 3_000 })
        .then(() => true)
        .catch(() => false);
      if (formReady) return;
      await new Promise((resolve) => setTimeout(resolve, 2_000 * attempt));
    }
    throw new Error(
      `/mi-cuenta/edit-account/ did not load after ${maxAttempts} attempts (last HTTP status: ${lastStatus ?? 'unknown'}).`,
    );
  }

  async revealForm(): Promise<void> {
    await this.updateInfoButton.click();
    await this.fields.firstName.waitFor({ state: 'visible' });
  }

  async revealPasswordForm(): Promise<void> {
    await this.updatePasswordButton.click();
    await this.passwordForm.waitFor({ state: 'visible' });
  }

  async fillField(field: ProfileField, value: string): Promise<void> {
    const locator = this.fields[field];
    const tag = await locator.evaluate((e) => e.tagName);
    if (tag === 'SELECT') {
      await locator.selectOption(value);
    } else {
      await locator.fill(value);
    }
  }

  async clearField(field: ProfileField): Promise<void> {
    await this.fields[field].fill('');
  }

  async getFieldValue(field: ProfileField): Promise<string> {
    return this.fields[field].inputValue();
  }

  async fillPasswordForm(current: string, newPw: string, confirm: string): Promise<void> {
    await this.currentPasswordInput.fill(current);
    await this.newPasswordInput.fill(newPw);
    await this.confirmPasswordInput.fill(confirm);
  }

  async submitInfo(): Promise<void> {
    await this.saveInfoButton.click();
  }

  async submitPassword(): Promise<void> {
    await this.savePasswordButton.click();
  }

  async profileSuccessMessage(): Promise<string> {
    return this.profileMessage.textContent().then((t) => t?.trim() ?? '');
  }

  async passwordSuccessMessage(): Promise<string> {
    return this.passwordMessage.textContent().then((t) => t?.trim() ?? '');
  }
}

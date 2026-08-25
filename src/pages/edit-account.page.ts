import type { Locator, Page } from '@playwright/test';

const SELECTORS = {
  profileField: '.profile-field',
  firstNameInput: '[name="first_name"]',
  lastNameInput: '[name="last_name"]',
  birthDateInput: '[name="birth_date"]',
  auxEmailInput: '[name="aux_email"]',
  genderSelect: '[name="gender"]',
  phoneInput: '[name="billing_phone"]',
  updateInfoButton: 'button.update-info-btn',
  saveButton: 'button.save-info-btn',
  cancelButton: 'button:has-text("Cancelar")',
  profileMessage: '#profile-message',
} as const;

const TEXT = {
  successMessage: 'Datos personales actualizados correctamente',
  accountNavigation: 'Páginas de cuenta',
  editAccountLink: 'Datos',
} as const;

export type ProfileField = 'firstName' | 'lastName' | 'birthDate' | 'email' | 'gender' | 'phone';

const FIELD_MAP: Record<ProfileField, string> = {
  firstName: SELECTORS.firstNameInput,
  lastName: SELECTORS.lastNameInput,
  birthDate: SELECTORS.birthDateInput,
  email: SELECTORS.auxEmailInput,
  gender: SELECTORS.genderSelect,
  phone: SELECTORS.phoneInput,
};

export class EditAccountPage {
  readonly updateInfoButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly profileMessage: Locator;
  readonly accountNavigation: Locator;

  private readonly fields: Record<ProfileField, Locator>;

  constructor(private readonly page: Page) {
    this.updateInfoButton = page.locator(SELECTORS.updateInfoButton).first();
    this.saveButton = page.locator(SELECTORS.saveButton).first();
    this.cancelButton = page.locator(SELECTORS.cancelButton).first();
    this.profileMessage = page.locator(SELECTORS.profileMessage);
    this.accountNavigation = page.getByRole('navigation', { name: TEXT.accountNavigation });

    this.fields = {
      firstName: page.locator(SELECTORS.firstNameInput),
      lastName: page.locator(SELECTORS.lastNameInput),
      birthDate: page.locator(SELECTORS.birthDateInput),
      email: page.locator(SELECTORS.auxEmailInput),
      gender: page.locator(SELECTORS.genderSelect),
      phone: page.locator(SELECTORS.phoneInput),
    };
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

  async clearAllFields(): Promise<void> {
    for (const field of ['firstName', 'lastName', 'birthDate', 'email', 'phone'] as ProfileField[]) {
      await this.clearField(field);
    }
  }

  async getFieldValue(field: ProfileField): Promise<string> {
    const locator = this.fields[field];
    const tag = await locator.evaluate((e) => e.tagName);
    if (tag === 'SELECT') {
      return locator.inputValue();
    }
    return locator.inputValue();
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
  }

  async successMessage(): Promise<string> {
    return this.profileMessage.textContent().then((t) => t?.trim() ?? '');
  }

  async isSuccessVisible(): Promise<boolean> {
    return this.profileMessage.isVisible();
  }
}

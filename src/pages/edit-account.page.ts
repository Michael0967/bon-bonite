import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick, humanType } from '../support/humanize';
import { report403 } from '../support/circuit-breaker';
import { throttleNavigation, throttleAction } from '../support/rate-limiter';

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
  addressModal: '#address-modal',
  modalContent: '#address-modal .modal-content',
  closeModal: '#address-modal .close-modal',
  editAddressButton: 'button.edit-address-button',
  deleteAddressButton: 'button.delete-address-button',
} as const;

const TEXT = {
  successMessage: 'Datos personales actualizados correctamente',
  accountNavigation: 'Páginas de cuenta',
  saveAddress: 'Guardar dirección',
} as const;

export type ProfileField = 'firstName' | 'lastName' | 'birthDate' | 'email' | 'gender' | 'phone';
export type AddressType = 'billing' | 'shipping';

type AddressFieldName =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'country'
  | 'state'
  | 'address1'
  | 'address2'
  | 'phone'
  | 'city'
  | 'postcode';

const ADDRESS_FIELDS: Record<AddressType, Partial<Record<AddressFieldName, string>>> = {
  billing: {
    firstName: '[name="billing_first_name"]',
    lastName: '[name="billing_last_name"]',
    email: '[name="billing_email"]',
    country: '[name="billing_country"]',
    state: '[name="billing_state"]',
    address1: '[name="billing_address_1"]',
    address2: '[name="billing_address_2"]',
    phone: '[name="billing_phone"]',
    city: '[name="billing_city"]',
    postcode: '[name="billing_postcode"]',
  },
  shipping: {
    firstName: '[name="shipping_first_name"]',
    lastName: '[name="shipping_last_name"]',
    email: '[name="shipping_email"]',
    country: '[name="shipping_country"]',
    state: '[name="shipping_state"]',
    address1: '[name="shipping_address_1"]',
    address2: '[name="shipping_address_2"]',
    phone: '[name="shipping_phone"]',
    city: '[name="shipping_city"]',
    postcode: '[name="shipping_postcode"]',
  },
};

export class EditAccountPage {
  readonly updateInfoButton: Locator;
  readonly saveInfoButton: Locator;
  readonly profileMessage: Locator;
  readonly accountNavigation: Locator;
  readonly updatePasswordButton: Locator;
  readonly savePasswordButton: Locator;
  readonly passwordForm: Locator;
  readonly passwordMessage: Locator;
  readonly editBillingButton: Locator;
  readonly deleteBillingButton: Locator;
  readonly editShippingButton: Locator;
  readonly deleteShippingButton: Locator;
  readonly addressModal: Locator;
  readonly modalContent: Locator;
  readonly closeModal: Locator;

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

    this.editBillingButton = page.locator(SELECTORS.editAddressButton).nth(0);
    this.deleteBillingButton = page.locator(SELECTORS.deleteAddressButton).nth(0);
    this.editShippingButton = page.locator(SELECTORS.editAddressButton).nth(1);
    this.deleteShippingButton = page.locator(SELECTORS.deleteAddressButton).nth(1);
    this.addressModal = page.locator(SELECTORS.addressModal);
    this.modalContent = page.locator(SELECTORS.modalContent);
    this.closeModal = page.locator(SELECTORS.closeModal);
  }

  async open(): Promise<void> {
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      let status = 0;
      try {
        const response =
          attempt === 1
            ? await this.page.goto('/mi-cuenta/edit-account/', { waitUntil: 'domcontentloaded', timeout: 15_000 })
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

      const formReady = await this.updateInfoButton
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (formReady) return;
      await humanDelay(5_000 * attempt, 8_000 * attempt);
    }
    throw new Error(
      `/mi-cuenta/edit-account/ did not load after ${maxAttempts} attempts.`,
    );
  }

  async revealForm(): Promise<void> {
    await humanClick(this.updateInfoButton);
    await this.fields.firstName.waitFor({ state: 'visible' });
  }

  async revealPasswordForm(): Promise<void> {
    await humanClick(this.updatePasswordButton);
    await this.passwordForm.waitFor({ state: 'visible' });
  }

  async fillField(field: ProfileField, value: string): Promise<void> {
    const locator = this.fields[field];
    await throttleAction();
    const tag = await locator.evaluate((e) => e.tagName);
    if (tag === 'SELECT') {
      await locator.selectOption(value);
    } else {
      await locator.fill('');
      await humanDelay(300, 700);
      await humanType(locator, value);
    }
    await humanDelay(1_000, 2_000);
  }

  async clearField(field: ProfileField): Promise<void> {
    await throttleAction();
    await this.fields[field].fill('');
  }

  async getFieldValue(field: ProfileField): Promise<string> {
    return this.fields[field].inputValue();
  }

  async profileSuccessMessage(): Promise<string> {
    return this.profileMessage.textContent().then((t) => t?.trim() ?? '');
  }

  async passwordSuccessMessage(): Promise<string> {
    return this.passwordMessage.textContent().then((t) => t?.trim() ?? '');
  }

  async fillPasswordForm(current: string, newPw: string, confirm: string): Promise<void> {
    await this.currentPasswordInput.fill('');
    await humanDelay(300, 700);
    await humanType(this.currentPasswordInput, current);
    await humanDelay(1_500, 3_000);
    await this.newPasswordInput.fill('');
    await humanDelay(300, 700);
    await humanType(this.newPasswordInput, newPw);
    await humanDelay(1_500, 3_000);
    await this.confirmPasswordInput.fill('');
    await humanDelay(300, 700);
    await humanType(this.confirmPasswordInput, confirm);
    await humanDelay(1_000, 2_500);
  }

  async submitInfo(): Promise<void> {
    await humanClick(this.saveInfoButton);
  }

  async submitPassword(): Promise<void> {
    await humanClick(this.savePasswordButton);
  }

  async openAddressModal(type: AddressType): Promise<void> {
    const btn = type === 'billing' ? this.editBillingButton : this.editShippingButton;
    await humanClick(btn);
    await this.addressModal.waitFor({ state: 'visible' });
    await throttleAction();
  }

  async closeAddressModal(): Promise<void> {
    await humanDelay(1_000, 2_000);
    await humanClick(this.closeModal);
    await this.addressModal.waitFor({ state: 'hidden' });
  }

  async fillAddress(type: AddressType, data: Partial<Record<AddressFieldName, string>>): Promise<void> {
    for (const [field, value] of Object.entries(data) as [AddressFieldName, string][]) {
      const selector = ADDRESS_FIELDS[type][field];
      if (!selector) continue;
      const locator = this.page.locator(selector);
      await throttleAction();
      const tag = await locator.evaluate((e) => e.tagName);
      if (tag === 'SELECT') {
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const optionExists = await locator.locator(`option[value="${escaped}"]`).count() > 0;
        if (!optionExists) continue;
        await locator.selectOption(value);
      } else {
        await locator.fill('');
        await humanDelay(300, 700);
        await humanType(locator, value);
      }
      await humanDelay(1_000, 2_000);
    }
  }

  async clearAddressFields(type: AddressType): Promise<void> {
    const fields = ADDRESS_FIELDS[type];
    for (const [field, selector] of Object.entries(fields)) {
      if (!selector) continue;
      const locator = this.page.locator(selector);
      const exists = await locator.count() > 0;
      if (!exists) continue;
      await throttleAction();
      const tag = await locator.evaluate((e) => e.tagName);
      if (tag === 'SELECT') {
        await locator.selectOption('');
      } else {
        await locator.fill('');
      }
    }
  }

  async saveAddress(type: AddressType): Promise<void> {
    const saveBtn = this.page.locator('button[name="save_address"]');
    await humanClick(saveBtn);
  }

  async deleteAddress(type: AddressType): Promise<void> {
    const btn = type === 'billing' ? this.deleteBillingButton : this.deleteShippingButton;
    this.page.once('dialog', (dialog) => dialog.accept());
    await humanDelay(2_000, 4_000);
    await btn.click();
  }

  async isDeleteButtonVisible(type: AddressType): Promise<boolean> {
    const btn = type === 'billing' ? this.deleteBillingButton : this.deleteShippingButton;
    return btn.isVisible();
  }

  async isAddressFieldVisible(type: AddressType, field: AddressFieldName): Promise<boolean> {
    const selector = ADDRESS_FIELDS[type][field];
    if (!selector) return false;
    return this.page.locator(selector).isVisible().catch(() => false);
  }

  async getAddressFieldValue(type: AddressType, field: AddressFieldName): Promise<string> {
    const selector = ADDRESS_FIELDS[type][field];
    if (!selector) return '';
    return this.page.locator(selector).inputValue();
  }

  async getCityOptions(type: AddressType): Promise<string[]> {
    const selector = ADDRESS_FIELDS[type].city;
    if (!selector) return [];
    const options = this.page.locator(`${selector} option`);
    const count = await options.count();
    const values: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) values.push(text.trim());
    }
    return values;
  }

  async getEditButtonText(type: AddressType): Promise<string> {
    const btn = type === 'billing' ? this.editBillingButton : this.editShippingButton;
    return btn.textContent().then((t) => t?.trim() ?? '');
  }

  async hasProfileValidationError(): Promise<boolean> {
    const error = this.page.locator('.woocommerce-error, .woocommerce-invalid');
    return error.isVisible().catch(() => false);
  }

  async hasAddressValidationError(): Promise<boolean> {
    const errorInModal = this.page.locator('#address-modal .woocommerce-error, #address-modal .woocommerce-invalid');
    if (await errorInModal.isVisible().catch(() => false)) return true;
    const errorOutside = this.page.locator('.woocommerce-error, .woocommerce-invalid');
    return errorOutside.isVisible().catch(() => false);
  }

  async isModalOpen(): Promise<boolean> {
    return this.addressModal.isVisible();
  }
}

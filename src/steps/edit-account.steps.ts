import { Given, Then, When } from '@cucumber/cucumber';
import { EditAccountPage } from '../pages/edit-account.page';
import type { AddressType } from '../pages/edit-account.page';
import { LoginPage } from '../pages/login.page';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import { saveSessionCookies } from '../support/session';
import type { BonboniteWorld } from '../support/world';

Given(
  'a logged-in customer on the edit account page',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await this.page.goto('/mi-cuenta/edit-account/');
    await this.page.waitForLoadState('networkidle').catch(() => {});

    const isLoggedIn = await this.page.locator('#username').count() === 0;

    if (isLoggedIn) {
      const formReady = await this.page.locator('button.update-info-btn')
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (formReady) return;
    }

    const loginPage = new LoginPage(this.page);
    await loginPage.open();

    await loginPage.fillCredentials(config.existingIdNumber, config.newPassword);
    await loginPage.submit();
    const navVisible = await loginPage.accountNavigation.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!navVisible) {
      await loginPage.open();
      await loginPage.fillCredentials(config.existingIdNumber, config.testPassword);
      await loginPage.submit();
      await loginPage.accountNavigation.waitFor({ state: 'visible' });
    }

    await saveSessionCookies(this.context);
    await editPage.open();
  },
);

// --- Profile steps ---

When(
  'they activate the edit form',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.revealForm();
  },
);

When(
  'they change their first name and last name',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillField('firstName', 'Michael');
    await editPage.fillField('lastName', 'Tester');
  },
);

When(
  'they update their phone number',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillField('phone', '987654321');
  },
);

When(
  'they try to change their email address',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillField('email', config.hackedEmail);
  },
);

When(
  'they clear required fields',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.clearField('firstName');
    await editPage.clearField('lastName');
    await editPage.clearField('email');
  },
);

When(
  'they save the changes',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.submitInfo();
  },
);

// --- Password steps ---

When(
  'they activate the password form',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.revealPasswordForm();
  },
);

When(
  'they enter their current password and a new password',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillPasswordForm(config.testPassword, config.newPassword, config.newPassword);
  },
);

When(
  'they enter a wrong current password',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillPasswordForm('WrongPass999', config.newPassword, config.newPassword);
  },
);

When(
  'they enter mismatched new passwords',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillPasswordForm(config.testPassword, config.newPassword, 'DifferentPass999');
  },
);

When(
  'they enter the same password as current',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillPasswordForm(config.testPassword, config.testPassword, config.testPassword);
  },
);

When(
  'they save the password changes',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.submitPassword();
  },
);

// --- Profile assertions ---

Then(
  'the success message is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await expect(editPage.profileMessage).toBeVisible();
    const text = await editPage.profileSuccessMessage();
    expect(text).toContain('Datos personales actualizados correctamente');
  },
);

Then(
  'the email should remain unchanged',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.revealForm();
    const email = await editPage.getFieldValue('email');
    expect(email).toBe(config.existingEmail);
  },
);

Then(
  'the required fields should not be empty',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.revealForm();
    const firstName = await editPage.getFieldValue('firstName');
    const lastName = await editPage.getFieldValue('lastName');
    const email = await editPage.getFieldValue('email');
    expect(firstName).toBeTruthy();
    expect(lastName).toBeTruthy();
    expect(email).toBeTruthy();
  },
);

Then(
  'the password error message is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await expect(editPage.passwordMessage).toBeVisible();
  },
);

Then(
  'the password is changed and they are redirected',
  async function (this: BonboniteWorld): Promise<void> {
    await this.page.waitForURL(/\/mi-cuenta\//, { timeout: 10_000 });
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/mi-cuenta/');
  },
);

Then(
  'the new password works for re-login',
  async function (this: BonboniteWorld): Promise<void> {
    await this.page.context().clearCookies();
    const loginPage = new LoginPage(this.page);
    await loginPage.open();
    await loginPage.fillCredentials(config.existingIdNumber, config.newPassword);
    await loginPage.submit();
    await loginPage.accountNavigation.waitFor({ state: 'visible' });
    await expect(loginPage.errorMessage).toHaveCount(0);
  },
);

// --- Address action steps ---

When(
  'they open the {word} address modal',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.openAddressModal(addressType);
  },
);

When(
  'they fill the {word} address with valid data',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    const data = config[addressType];
    const fields: Record<string, string> = {
      firstName: data.firstName,
      lastName: data.lastName,
      address1: data.address1,
    };
    if ('phone' in data) fields.phone = (data as { phone: string }).phone;
    await editPage.fillAddress(addressType, fields as any);
  },
);

When(
  'they clear the {word} address fields',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.clearAddressFields(addressType);
  },
);

When(
  'they save the {word} address',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.saveAddress(addressType);
  },
);

When(
  'they delete the {word} address',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.deleteAddress(addressType);
  },
);

When(
  'they enter non-numeric characters in the {word} phone field',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.fillAddress(addressType, { phone: 'abcDEF123' } as any);
  },
);

// --- Address assertions: happy paths ---

Then(
  'the {word} address is saved successfully',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await editPage.closeAddressModal();
    const firstName = await editPage.getAddressFieldValue(addressType, 'firstName');
    expect(firstName).toBeTruthy();
  },
);

Then(
  'the {word} address is removed',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    const configured = await editPage.isAddressFieldVisible(addressType, 'firstName');
    expect(configured).toBe(false);
  },
);

// --- Address assertions: bug scenarios (assert CORRECT behavior → FAILS when bug exists) ---

Then(
  'the {word} delete button should not be visible',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    const visible = await editPage.isDeleteButtonVisible(addressType);
    expect(visible).toBe(false);
  },
);

Then(
  'the {word} edit button should say Add',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    const text = await editPage.getEditButtonText(addressType);
    expect(text.toLowerCase()).not.toContain('editar');
  },
);

Then(
  'a validation error is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    const hasError = await editPage.hasValidationError();
    expect(hasError).toBe(true);
  },
);

Then(
  'the {word} city dropdown should have city options',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    const options = await editPage.getCityOptions(addressType);
    const realCities = options.filter((o) => !o.includes('Elige una'));
    expect(realCities.length).toBeGreaterThan(0);
  },
);

Then(
  'the {word} email field should be pre-filled',
  async function (this: BonboniteWorld, addressType: AddressType): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    const email = await editPage.getAddressFieldValue(addressType, 'email');
    expect(email).toBeTruthy();
  },
);

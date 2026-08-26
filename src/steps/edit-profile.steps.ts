import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import { editPage } from '../support/edit-page';
import { loginPage } from '../support/login-page';
import { saveSessionCookies } from '../support/session';
import type { BonboniteWorld } from '../support/world';

Given(
  'a logged-in customer on the edit account page',
  async function (this: BonboniteWorld): Promise<void> {
    const page = this.page;
    await page.goto('/mi-cuenta/edit-account/');
    const isLoggedIn = await page.locator('#username').count() === 0;

    if (isLoggedIn) {
      const formReady = await page.locator('button.update-info-btn')
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (formReady) return;
    }

    const lp = loginPage(this);
    await lp.open();
    await lp.fillCredentials(config.existingIdNumber, config.newPassword);
    await lp.submit();
    const navVisible = await lp.accountNavigation.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!navVisible) {
      await lp.open();
      await lp.fillCredentials(config.existingIdNumber, config.testPassword);
      await lp.submit();
      await lp.accountNavigation.waitFor({ state: 'visible' });
    }

    await saveSessionCookies(this.context);
    await editPage(this).open();
  },
);

// --- Profile steps ---

When(
  'they activate the edit form',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).revealForm();
  },
);

When(
  'they change their first name and last name',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillField('firstName', 'Michael');
    await editPage(this).fillField('lastName', 'Tester');
  },
);

When(
  'they update their phone number',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillField('phone', '987654321');
  },
);

When(
  'they enter non-numeric characters in the profile phone field',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillField('phone', 'abcDEF123');
  },
);

When(
  'they try to change their email address',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillField('email', config.hackedEmail);
  },
);

When(
  'they clear required fields',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).clearField('firstName');
    await editPage(this).clearField('lastName');
    await editPage(this).clearField('email');
  },
);

When(
  'they save the changes',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).submitInfo();
  },
);

// --- Password steps ---

When(
  'they activate the password form',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).revealPasswordForm();
  },
);

When(
  'they enter their current password and a new password',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillPasswordForm(config.testPassword, config.newPassword, config.newPassword);
  },
);

When(
  'they enter a wrong current password',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillPasswordForm('WrongPass999', config.newPassword, config.newPassword);
  },
);

When(
  'they enter mismatched new passwords',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillPasswordForm(config.testPassword, config.newPassword, 'DifferentPass999');
  },
);

When(
  'they enter the same password as current',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).fillPasswordForm(config.testPassword, config.testPassword, config.testPassword);
  },
);

When(
  'they save the password changes',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).submitPassword();
  },
);

// --- Profile assertions ---

Then(
  'the success message is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(editPage(this).profileMessage).toBeVisible();
    const text = await editPage(this).profileSuccessMessage();
    expect(text).toContain('Datos personales actualizados correctamente');
  },
);

Then(
  'the email should remain unchanged',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).revealForm();
    const email = await editPage(this).getFieldValue('email');
    expect(email).toBe(config.existingEmail);
  },
);

Then(
  'the required fields should not be empty',
  async function (this: BonboniteWorld): Promise<void> {
    await editPage(this).revealForm();
    const firstName = await editPage(this).getFieldValue('firstName');
    const lastName = await editPage(this).getFieldValue('lastName');
    const email = await editPage(this).getFieldValue('email');
    expect(firstName).toBeTruthy();
    expect(lastName).toBeTruthy();
    expect(email).toBeTruthy();
  },
);

Then(
  'the password error message is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(editPage(this).passwordMessage).toBeVisible();
  },
);

Then(
  'the password is changed and they are redirected',
  async function (this: BonboniteWorld): Promise<void> {
    await this.page.waitForURL(/\/mi-cuenta\//, { timeout: 10_000 });
    expect(this.page.url()).toContain('/mi-cuenta/');
  },
);

Then(
  'the new password works for re-login',
  async function (this: BonboniteWorld): Promise<void> {
    await this.page.context().clearCookies();
    const lp = loginPage(this);
    await lp.open();
    await lp.fillCredentials(config.existingIdNumber, config.newPassword);
    await lp.submit();
    await lp.accountNavigation.waitFor({ state: 'visible' });
    await expect(lp.errorMessage).toHaveCount(0);
  },
);

Then(
  'a profile validation error is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const hasError = await editPage(this).hasProfileValidationError();
    expect(hasError).toBe(true);
  },
);

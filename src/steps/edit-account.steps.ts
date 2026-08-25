import { Given, Then, When } from '@cucumber/cucumber';
import { EditAccountPage } from '../pages/edit-account.page';
import { LoginPage } from '../pages/login.page';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import type { BonboniteWorld } from '../support/world';

Given(
  'a logged-in customer on the edit account page',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await loginPage.open();

    // Try new password first (in case it was changed in a previous run)
    await loginPage.fillCredentials(config.existingIdNumber, config.newPassword);
    await loginPage.submit();
    const navVisible = await loginPage.accountNavigation.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!navVisible) {
      // Fallback to original password
      await loginPage.open();
      await loginPage.fillCredentials(config.existingIdNumber, config.testPassword);
      await loginPage.submit();
      await loginPage.accountNavigation.waitFor({ state: 'visible' });
    }

    const editPage = new EditAccountPage(this.page);
    await editPage.open();
  },
);

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
    // Clear cookies to force logout
    await this.page.context().clearCookies();

    const loginPage = new LoginPage(this.page);
    await loginPage.open();
    await loginPage.fillCredentials(config.existingIdNumber, config.newPassword);
    await loginPage.submit();
    await loginPage.accountNavigation.waitFor({ state: 'visible' });
    await expect(loginPage.errorMessage).toHaveCount(0);
  },
);

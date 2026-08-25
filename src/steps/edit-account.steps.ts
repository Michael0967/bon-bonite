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
    await loginPage.fillCredentials(config.existingIdNumber, config.testPassword);
    await loginPage.submit();
    await loginPage.accountNavigation.waitFor({ state: 'visible' });

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
    await editPage.fillField('email', 'hacked@evil.com');
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
    await editPage.submit();
  },
);

Then(
  'the success message is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const editPage = new EditAccountPage(this.page);
    await expect(editPage.profileMessage).toBeVisible();
    const text = await editPage.successMessage();
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

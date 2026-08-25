import { Given, Then, When } from '@cucumber/cucumber';
import { LoginPage } from '../pages/login.page';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import type { BonboniteWorld } from '../support/world';
import { tenDigitNumber } from '../support/user';

Given(
  'a visitor on the login page',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await loginPage.open();
  },
);

Given(
  'a registered customer on the login page',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await loginPage.open();
  },
);

When(
  'they try to log in without entering any credentials',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await loginPage.submit();
  },
);

Then(
  'the browser blocks the request and asks for both fields',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    const usernameMsg = await loginPage.validationMessageFor('username');
    const passwordMsg = await loginPage.validationMessageFor('password');
    expect(usernameMsg).toBeTruthy();
    expect(passwordMsg).toBeTruthy();
  },
);

When(
  'they enter their ID number and an incorrect password',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await loginPage.fillCredentials(config.existingIdNumber, 'WrongPass999');
    await loginPage.submit();
  },
);

Then(
  'the system informs them that the username or password is invalid',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Nombre de usuario o contraseña inválidos',
    );
  },
);

When(
  'they enter an unregistered ID number and a password',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await loginPage.fillCredentials(tenDigitNumber(), config.testPassword);
    await loginPage.submit();
  },
);

When(
  'they enter their correct ID number and password',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await loginPage.fillCredentials(config.existingIdNumber, config.testPassword);
    await loginPage.submit();
  },
);

Then(
  'the system grants access and displays their account area',
  async function (this: BonboniteWorld): Promise<void> {
    const loginPage = new LoginPage(this.page);
    await expect(loginPage.accountNavigation).toBeVisible();
    await expect(loginPage.errorMessage).toHaveCount(0);
  },
);

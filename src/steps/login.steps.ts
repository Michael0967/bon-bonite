import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import { loginPage } from '../support/login-page';
import type { BonboniteWorld } from '../support/world';
import { tenDigitNumber } from '../support/user';

Given(
  'a visitor on the login page',
  async function (this: BonboniteWorld): Promise<void> {
    await loginPage(this).open();
  },
);

Given(
  'a registered customer on the login page',
  async function (this: BonboniteWorld): Promise<void> {
    await loginPage(this).open();
  },
);

When(
  'they try to log in without entering any credentials',
  async function (this: BonboniteWorld): Promise<void> {
    await loginPage(this).submit();
  },
);

Then(
  'the form is not submitted and asks them to complete the missing information',
  async function (this: BonboniteWorld): Promise<void> {
    const usernameMsg = await loginPage(this).validationMessageFor('username');
    const passwordMsg = await loginPage(this).validationMessageFor('password');
    expect(usernameMsg).toBeTruthy();
    expect(passwordMsg).toBeTruthy();
  },
);

When(
  'they enter their ID number and an incorrect password',
  async function (this: BonboniteWorld): Promise<void> {
    await loginPage(this).fillCredentials(config.existingIdNumber, 'WrongPass999');
    await loginPage(this).submit();
  },
);

Then(
  'the system informs them that the username or password is invalid',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(loginPage(this).errorMessage).toBeVisible();
    await expect(loginPage(this).errorMessage).toContainText(
      'Nombre de usuario o contraseña inválidos',
    );
  },
);

When(
  'they enter an unregistered ID number and a password',
  async function (this: BonboniteWorld): Promise<void> {
    await loginPage(this).fillCredentials(tenDigitNumber(), config.testPassword);
    await loginPage(this).submit();
  },
);

When(
  'they enter their correct ID number and password',
  async function (this: BonboniteWorld): Promise<void> {
    await loginPage(this).fillCredentials(config.existingIdNumber, config.testPassword);
    await loginPage(this).submit();
  },
);

Then(
  'the system grants access and displays their account area',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(loginPage(this).accountNavigation).toBeVisible();
    await expect(loginPage(this).errorMessage).toHaveCount(0);
  },
);

import { Given, Then, When } from '@cucumber/cucumber';
import { RegisterPage } from '../pages/register.page';
import { expect } from '../support/assertions';
import type { BonboniteWorld } from '../support/world';
import { newRegistrationData, type RegistrationData } from '../support/user';

Given(
  'a new visitor who does not have a store account yet',
  async function (this: BonboniteWorld): Promise<void> {
    const registerPage = new RegisterPage(this.page);
    await registerPage.open();
    await registerPage.revealForm();
  },
);

When(
  'they decide to sign up and complete the form with their personal details and email address',
  async function (this: BonboniteWorld): Promise<void> {
    const data = newRegistrationData();
    this.userData.registration = data;
    await this.attach(JSON.stringify({ ...data, password: '***' }, null, 2), 'application/json');

    const registerPage = new RegisterPage(this.page);
    await registerPage.fill(data);
    await registerPage.submit();
  },
);

Then(
  'their account is created and their session starts automatically',
  async function (this: BonboniteWorld): Promise<void> {
    const { firstName } = this.userData.registration as RegistrationData;
    const registerPage = new RegisterPage(this.page);
    await expect(registerPage.accountNavigation).toBeVisible();
    await expect(registerPage.greeting(firstName)).toBeVisible();
    await expect(registerPage.errorMessage).toHaveCount(0);
  },
);

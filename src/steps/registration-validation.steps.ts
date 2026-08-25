import { Then, When } from '@cucumber/cucumber';
import {
  RegisterPage,
  type FieldKey,
  type MandatoryField,
} from '../pages/register.page';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import type { BonboniteWorld } from '../support/world';
import { newRegistrationData } from '../support/user';

const FIELD_BY_LABEL: Record<string, FieldKey> = {
  'ID number': 'username',
  'first name': 'firstName',
  'last name': 'lastName',
  'email address': 'email',
  password: 'password',
  'password confirmation': 'confirmPassword',
};

const PRIVACY_LABEL = 'privacy consent';

When(
  'they try to sign up without completing their {string}',
  async function (this: BonboniteWorld, fieldLabel: string): Promise<void> {
    const registerPage = new RegisterPage(this.page);
    const data = newRegistrationData();

    if (fieldLabel === PRIVACY_LABEL) {
      this.userData.flaggedField = 'privacy';
      await registerPage.fill(data, { acceptPrivacy: false });
    } else {
      const fieldKey = FIELD_BY_LABEL[fieldLabel];
      if (!fieldKey) throw new Error(`Unknown registration field: ${fieldLabel}`);
      this.userData.flaggedField = fieldKey;
      await registerPage.fill({ ...data, [fieldKey]: '' });
    }
    await registerPage.submit();
  },
);

When(
  'they try to sign up with an email address that is already registered',
  async function (this: BonboniteWorld): Promise<void> {
    if (!config.existingEmail) {
      throw new Error('BB_EXISTING_EMAIL is not set in .env');
    }
    const data = newRegistrationData();
    data.email = config.existingEmail;
    const registerPage = new RegisterPage(this.page);
    await registerPage.fill(data);
    await registerPage.submit();
  },
);

When(
  'they try to sign up with an ID number that is already registered',
  async function (this: BonboniteWorld): Promise<void> {
    if (!config.existingIdNumber) {
      throw new Error('BB_EXISTING_ID_NUMBER is not set in .env');
    }
    const data = newRegistrationData();
    data.username = config.existingIdNumber;
    const registerPage = new RegisterPage(this.page);
    await registerPage.fill(data);
    await registerPage.submit();
  },
);

When(
  'they try to sign up with a password shorter than 8 characters',
  async function (this: BonboniteWorld): Promise<void> {
    const data = newRegistrationData();
    const weakPassword = 'Abc123d';
    const registerPage = new RegisterPage(this.page);
    await registerPage.fill({ ...data, password: weakPassword, confirmPassword: weakPassword });
    await registerPage.submit();
  },
);

When(
  'they sign up with a password of exactly 8 characters',
  async function (this: BonboniteWorld): Promise<void> {
    const data = newRegistrationData();
    const minimumPassword = 'Passw0rd';
    this.userData.registration = data;
    const registerPage = new RegisterPage(this.page);
    await registerPage.fill({
      ...data,
      password: minimumPassword,
      confirmPassword: minimumPassword,
    });
    await registerPage.submit();
  },
);

Then(
  'the form is not submitted and asks them to complete the missing information',
  async function (this: BonboniteWorld): Promise<void> {
    const flaggedField = this.userData.flaggedField as MandatoryField;
    const registerPage = new RegisterPage(this.page);
    await expect(registerPage.form).toBeVisible();
    const validationMessage = await registerPage.validationMessageFor(flaggedField);
    expect(validationMessage).not.toBe('');
    await expect(registerPage.errorMessage).toHaveCount(0);
  },
);

Then(
  'the system explains that this email address is already registered',
  async function (this: BonboniteWorld): Promise<void> {
    const registerPage = new RegisterPage(this.page);
    await expect(registerPage.errorMessage).toBeVisible();
    await expect(registerPage.errorMessage).toContainText('ya hay una cuenta registrada', {
      ignoreCase: true,
    });
  },
);

Then(
  'the system explains that this ID number is already registered',
  async function (this: BonboniteWorld): Promise<void> {
    const registerPage = new RegisterPage(this.page);
    await expect(registerPage.errorMessage).toBeVisible();
    await expect(registerPage.errorMessage).toContainText(
      'ya se ha registrado una cuenta con ese nombre de usuario',
      { ignoreCase: true },
    );
  },
);

Then(
  'the form is not submitted and warns that the password must have at least 8 characters',
  async function (this: BonboniteWorld): Promise<void> {
    const registerPage = new RegisterPage(this.page);
    await expect(registerPage.shortPasswordWarning).toBeVisible();
    await expect(registerPage.form).toBeVisible();
    await expect(registerPage.errorMessage).toHaveCount(0);
  },
);

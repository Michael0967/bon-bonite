import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../support/assertions';
import { registerPage } from '../support/register-page';
import type { BonboniteWorld } from '../support/world';
import { newRegistrationData, type RegistrationData } from '../support/user';

Given(
  'a new visitor who does not have a store account yet',
  async function (this: BonboniteWorld): Promise<void> {
    const rp = registerPage(this);
    await rp.open();

    if (!(await rp.isLoginFormVisible())) {
      const authPatterns = ['wordpress_logged_in', 'wordpress_sec', 'wp_woocommerce_session'];
      const cookies = await this.page.context().cookies();
      for (const c of cookies.filter((x) => authPatterns.some((p) => x.name.startsWith(p)))) {
        await this.page.context().clearCookies({ name: c.name, domain: c.domain, path: c.path });
      }
      await rp.open();
    }

    await rp.revealForm();
  },
);

When(
  'they decide to sign up and complete the form with their personal details and email address',
  async function (this: BonboniteWorld): Promise<void> {
    const data = newRegistrationData();
    this.userData.registration = data;
    await this.attach(JSON.stringify({ ...data, password: '***' }, null, 2), 'application/json');

    await registerPage(this).fill(data);
    await registerPage(this).submit();
  },
);

Then(
  'their account is created and their session starts automatically',
  async function (this: BonboniteWorld): Promise<void> {
    const { firstName } = this.userData.registration as RegistrationData;
    await expect(registerPage(this).accountNavigation).toBeVisible();
    await expect(registerPage(this).greeting(firstName)).toBeVisible();
    await expect(registerPage(this).errorMessage).toHaveCount(0);
  },
);

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import { checkoutPage } from '../support/checkout-page';
import type { BonboniteWorld } from '../support/world';

Given(
  'they go to the checkout page',
  async function (this: BonboniteWorld): Promise<void> {
    await checkoutPage(this).open();
  },
);

When(
  'they click the continue button',
  async function (this: BonboniteWorld): Promise<void> {
    await checkoutPage(this).clickContinue();
  },
);

Given(
  'they log in at checkout',
  async function (this: BonboniteWorld): Promise<void> {
    const cp = checkoutPage(this);
    if (await cp.hasLoginForm()) {
      let loggedIn = await cp.loginInCheckout(config.existingIdNumber, config.testPassword);
      if (!loggedIn) {
        loggedIn = await cp.loginInCheckout(config.existingIdNumber, config.newPassword);
      }
      if (!loggedIn) {
        throw new Error('Login failed with both passwords');
      }
    }
  },
);

Then(
  'the cart summary is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).cartSummary).toBeVisible();
  },
);

Then(
  'the cart summary contains the product name',
  async function (this: BonboniteWorld): Promise<void> {
    const items = await checkoutPage(this).getOrderItems();
    expect(items.length).toBeGreaterThan(0);
  },
);

Then(
  'the cart summary shows a subtotal',
  async function (this: BonboniteWorld): Promise<void> {
    const text = await checkoutPage(this).getSubtotalText();
    expect(text).toMatch(/\$/);
  },
);

Then(
  'the cart summary shows a total',
  async function (this: BonboniteWorld): Promise<void> {
    const text = await checkoutPage(this).getOrderTotalText();
    expect(text).toMatch(/\$/);
  },
);

Then(
  'the billing form is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const visible = await checkoutPage(this).hasBillingForm();
    expect(visible).toBe(true);
  },
);

Then(
  'the document type selector is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingDocumentType).toBeVisible();
  },
);

Then(
  'the billing first name field is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingFirstName).toBeVisible();
  },
);

Then(
  'the billing last name field is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingLastName).toBeVisible();
  },
);

Then(
  'the billing gender selector is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingGender).toBeVisible();
  },
);

Then(
  'the billing email field is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingEmail).toBeVisible();
  },
);

Then(
  'the billing phone field is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingPhone).toBeVisible();
  },
);

Then(
  'the billing address field is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingAddress1).toBeVisible();
  },
);

When(
  'they fill the billing first name with {string}',
  async function (this: BonboniteWorld, value: string): Promise<void> {
    await checkoutPage(this).fillBillingField('firstName', value);
  },
);

When(
  'they fill the billing last name with {string}',
  async function (this: BonboniteWorld, value: string): Promise<void> {
    await checkoutPage(this).fillBillingField('lastName', value);
  },
);

When(
  'they fill the billing phone with {string}',
  async function (this: BonboniteWorld, value: string): Promise<void> {
    await checkoutPage(this).fillBillingField('phone', value);
  },
);

Then(
  'the billing first name field contains {string}',
  async function (this: BonboniteWorld, expected: string): Promise<void> {
    const val = await checkoutPage(this).billingFirstName.inputValue();
    expect(val).toContain(expected);
  },
);

Then(
  'the billing last name field contains {string}',
  async function (this: BonboniteWorld, expected: string): Promise<void> {
    const val = await checkoutPage(this).billingLastName.inputValue();
    expect(val).toContain(expected);
  },
);

Then(
  'the place order button is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const visible = await checkoutPage(this).hasPlaceOrderButton();
    expect(visible).toBe(true);
  },
);

When(
  'they accept the terms and conditions',
  async function (this: BonboniteWorld): Promise<void> {
    await checkoutPage(this).acceptTerms();
  },
);

When(
  'they click place order',
  async function (this: BonboniteWorld): Promise<void> {
    await checkoutPage(this).clickPlaceOrder();
  },
);

Then(
  'the order confirmation is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const visible = await checkoutPage(this).isOrderConfirmationVisible();
    expect(visible).toBe(true);
  },
);

Then(
  'the order has a number',
  async function (this: BonboniteWorld): Promise<void> {
    const num = await checkoutPage(this).getOrderNumber();
    expect(num.length).toBeGreaterThan(0);
  },
);

Then(
  'the order shows a total',
  async function (this: BonboniteWorld): Promise<void> {
    const text = await checkoutPage(this).getConfirmationTotalText();
    expect(text).toMatch(/\$/);
  },
);

Then(
  'the order payment method is Wompi',
  async function (this: BonboniteWorld): Promise<void> {
    const method = await checkoutPage(this).getOrderPaymentMethod();
    expect(method.toLowerCase()).toContain('wompi');
  },
);

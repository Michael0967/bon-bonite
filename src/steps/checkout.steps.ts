import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../support/assertions';
import { config } from '../support/config';
import { productPage } from '../support/product-page';
import { checkoutPage } from '../support/checkout-page';
import type { BonboniteWorld } from '../support/world';

const PRODUCT_SLUG = 'baleta-con-taches-en-cuero-capuccino';

Given(
  'a product is in the cart',
  async function (this: BonboniteWorld): Promise<void> {
    const pp = productPage(this);
    await pp.open(PRODUCT_SLUG);
    await pp.selectFirstVariation();
    await pp.clickAddToCart();
  },
);

Given(
  'they go to the checkout page',
  async function (this: BonboniteWorld): Promise<void> {
    await checkoutPage(this).open();
  },
);

Then(
  'the checkout form is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const hasForm = await checkoutPage(this).hasCheckoutForm();
    expect(hasForm).toBe(true);
  },
);

Then(
  'the billing first name field is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).billingFirstName).toBeVisible();
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
  'the order review section is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).orderReview).toBeVisible();
  },
);

Then(
  'the order summary contains the product',
  async function (this: BonboniteWorld): Promise<void> {
    const items = await checkoutPage(this).getOrderItems();
    expect(items.length).toBeGreaterThan(0);
  },
);

Then(
  'the payment methods section is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const visible = await checkoutPage(this).hasPaymentMethods();
    expect(visible).toBe(true);
  },
);

Then(
  'at least {int} payment method is available',
  async function (this: BonboniteWorld, minCount: number): Promise<void> {
    const count = await checkoutPage(this).getPaymentMethodCount();
    expect(count).toBeGreaterThanOrEqual(minCount);
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
  'they fill the billing email with a test email',
  async function (this: BonboniteWorld): Promise<void> {
    await checkoutPage(this).fillBillingField('email', config.existingEmail);
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
  'the place order button is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(checkoutPage(this).placeOrderButton).toBeVisible();
  },
);

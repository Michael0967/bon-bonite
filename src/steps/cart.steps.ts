import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../support/assertions';
import { cartPage } from '../support/cart-page';
import type { BonboniteWorld } from '../support/world';

Given(
  'they open the cart page',
  async function (this: BonboniteWorld): Promise<void> {
    await cartPage(this).open();
  },
);

Then(
  'the cart is not empty',
  async function (this: BonboniteWorld): Promise<void> {
    const empty = await cartPage(this).isCartEmpty();
    expect(empty).toBe(false);
  },
);

Then(
  'the cart contains {int} item(s)',
  async function (this: BonboniteWorld, expected: number): Promise<void> {
    const count = await cartPage(this).getItemCount();
    expect(count).toBe(expected);
  },
);

Then(
  'the cart subtotal is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const text = await cartPage(this).getSubtotalText();
    expect(text).toMatch(/\$/);
  },
);

Then(
  'the cart total is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const text = await cartPage(this).getTotalText();
    expect(text).toMatch(/\$/);
  },
);

Then(
  'the proceed to checkout button is visible',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(cartPage(this).proceedToCheckout).toBeVisible();
  },
);

When(
  'they remove the product from the cart',
  async function (this: BonboniteWorld): Promise<void> {
    await cartPage(this).removeProduct(0);
  },
);

Then(
  'the cart is empty',
  async function (this: BonboniteWorld): Promise<void> {
    const empty = await cartPage(this).isCartEmpty();
    expect(empty).toBe(true);
  },
);

Then(
  'the empty cart message is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(cartPage(this).emptyMessage).toBeVisible();
  },
);

When(
  'they apply the coupon {string}',
  async function (this: BonboniteWorld, code: string): Promise<void> {
    await cartPage(this).applyCoupon(code);
  },
);

Then(
  'a coupon error message is displayed',
  async function (this: BonboniteWorld): Promise<void> {
    const text = await cartPage(this).getCouponErrorText();
    expect(text.length).toBeGreaterThan(0);
  },
);

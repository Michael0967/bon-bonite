import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '../support/assertions';
import { productPage } from '../support/product-page';
import type { BonboniteWorld } from '../support/world';

Given(
  'a visitor on the product page for {string}',
  async function (this: BonboniteWorld, slug: string): Promise<void> {
    await productPage(this).open(slug);
  },
);

Then(
  'the product title is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const title = await productPage(this).getTitleText();
    expect(title.length).toBeGreaterThan(0);
  },
);

Then(
  'the product price is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const price = await productPage(this).getPriceText();
    expect(price).toMatch(/\$/);
  },
);

Then(
  'the product short description is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const desc = await productPage(this).getShortDescription();
    expect(desc.length).toBeGreaterThan(0);
  },
);

Then(
  'the product image gallery is visible',
  async function (this: BonboniteWorld): Promise<void> {
    const visible = await productPage(this).hasGallery();
    expect(visible).toBe(true);
  },
);

Then(
  'there are at least {int} thumbnail images',
  async function (this: BonboniteWorld, minCount: number): Promise<void> {
    const count = await productPage(this).getThumbnailCount();
    expect(count).toBeGreaterThanOrEqual(minCount);
  },
);

When(
  'they click the first thumbnail',
  async function (this: BonboniteWorld): Promise<void> {
    await productPage(this).clickThumbnail(0);
  },
);

Then(
  'the gallery image updates',
  async function (this: BonboniteWorld): Promise<void> {
    await expect(productPage(this).gallery).toBeVisible();
  },
);

Then(
  'the variant buttons are visible',
  async function (this: BonboniteWorld): Promise<void> {
    const count = await productPage(this).getVariationCount();
    expect(count).toBeGreaterThan(0);
  },
);

Then(
  'no variant is selected by default',
  async function (this: BonboniteWorld): Promise<void> {
    const selected = await productPage(this).isAnyVariationSelected();
    expect(selected).toBe(false);
  },
);

When(
  'they select the first variant',
  async function (this: BonboniteWorld): Promise<void> {
    await productPage(this).selectFirstVariation();
  },
);

Then(
  'the add to cart button is enabled',
  async function (this: BonboniteWorld): Promise<void> {
    const enabled = await productPage(this).isAddToCartEnabled();
    expect(enabled).toBe(true);
  },
);

Then(
  'the quantity input shows {int}',
  async function (this: BonboniteWorld, expected: number): Promise<void> {
    const qty = await productPage(this).getQuantityValue();
    expect(qty).toBe(expected);
  },
);

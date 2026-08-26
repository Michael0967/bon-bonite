import { Given, Then, When } from '@cucumber/cucumber';
import { ShoppingPage } from '../pages/shopping.page';
import { expect } from '../support/assertions';
import { humanDelay } from '../support/humanize';
import type { BonboniteWorld } from '../support/world';

function shopPage(world: BonboniteWorld): ShoppingPage {
  if (!world.userData.shopPage) {
    world.userData.shopPage = new ShoppingPage(world.page);
  }
  return world.userData.shopPage as ShoppingPage;
}

Given(
  'a visitor on the Bon Bonite homepage',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).warmUp();
  },
);

When(
  'they navigate to the Zapatos category',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).openCategory();
  },
);

When(
  'they find the product card for {string}',
  async function (this: BonboniteWorld, productName: string): Promise<void> {
    await shopPage(this).findProductCard(productName);
  },
);

When(
  'they hover over that product card',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).hoverProductCard();
  },
);

Then(
  'the color thumbnail strip becomes visible',
  async function (this: BonboniteWorld): Promise<void> {
    const visible = await shopPage(this).isColorThumbnailStripVisible();
    expect(visible).toBe(true);
  },
);

When(
  'they click the second color thumbnail',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).clickColorThumbnail(1);
  },
);

Then(
  'the main product image changes to the selected variant',
  async function (this: BonboniteWorld): Promise<void> {
    const changed = await shopPage(this).didMainImageChange();
    expect(changed).toBe(true);
  },
);

When(
  'they click on the product card link',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).clickProductCardLink();
  },
);

Then(
  'they are redirected to the product page',
  async function (this: BonboniteWorld): Promise<void> {
    const onProduct = await shopPage(this).isOnProductPage();
    expect(onProduct).toBe(true);
    const currentUrl = await shopPage(this).getProductPageUrl();
    const expectedUrl = await shopPage(this).getExpectedProductUrl();
    expect(currentUrl).toContain('/producto/');
    expect(currentUrl).toContain(expectedUrl);
  },
);

Then(
  'the product page displays its title',
  async function (this: BonboniteWorld): Promise<void> {
    const title = await shopPage(this).getProductTitle();
    expect(title.length).toBeGreaterThan(0);
  },
);

Then(
  'the add to cart button state matches the variant selection rules',
  async function (this: BonboniteWorld): Promise<void> {
    const variantCount = await shopPage(this).getVisibleVariantCount();
    if (variantCount === 0) {
      const enabled = await shopPage(this).isAddToCartButtonEnabled();
      expect(enabled).toBe(true);
    } else {
      const preselected = await shopPage(this).isAnyVariantPreselected();
      const enabled = await shopPage(this).isAddToCartButtonEnabled();
      if (!preselected) {
        expect(enabled).toBe(false);
      }
    }
  },
);

When(
  'they select the first available variant',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).selectFirstVariant();
  },
);

When(
  'they click on Comprar Ahora',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).clickBuyNow();
  },
);

When(
  'they click on Anadir al carrito',
  async function (this: BonboniteWorld): Promise<void> {
    await shopPage(this).clickAddToCart();
  },
);

Then(
  'they are redirected to the cart page',
  async function (this: BonboniteWorld): Promise<void> {
    const onCart = await shopPage(this).isOnCartPage();
    expect(onCart).toBe(true);
  },
);

Then(
  'the cart badge displays {int}',
  async function (this: BonboniteWorld, expectedCount: number): Promise<void> {
    const count = await shopPage(this).getCartBadgeCount();
    expect(count).toBe(expectedCount);
  },
);

Then(
  'the success message confirms the product was added to cart',
  async function (this: BonboniteWorld): Promise<void> {
    const visible = await shopPage(this).isWooMessageVisible();
    expect(visible).toBe(true);
    const text = await shopPage(this).getWooMessageText();
    expect(text).toContain('se ha añadido a tu carrito');
  },
);

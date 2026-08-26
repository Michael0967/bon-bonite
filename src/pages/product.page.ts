import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick } from '../support/humanize';
import { waitForCooldown, report403 } from '../support/circuit-breaker';
import { throttleNavigation, throttleAction } from '../support/rate-limiter';

export class ProductPage {
  readonly title: Locator;
  readonly price: Locator;
  readonly shortDescription: Locator;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly gallery: Locator;
  readonly thumbnails: Locator;
  readonly variationButtons: Locator;
  readonly wooMessage: Locator;
  readonly cartBadge: Locator;

  private productSlug = '';

  constructor(private readonly page: Page) {
    this.title = page.locator('h1.product_title').first();
    this.price = page.locator('p.price').first();
    this.shortDescription = page.locator('.woocommerce-product-details__short-description').first();
    this.addToCartButton = page.locator('button.single_add_to_cart_button').first();
    this.quantityInput = page.locator('input.qty[name="quantity"]').first();
    this.gallery = page.locator('div.swiper.product-gallery').first();
    this.thumbnails = page.locator('div.swiper.product-thumbs .swiper-slide');
    this.variationButtons = page.locator('button.variation-button');
    this.wooMessage = page.locator('.woocommerce-message').first();
    this.cartBadge = page.locator('.cart-contents-count').first();
  }

  async open(slug: string): Promise<void> {
    this.productSlug = slug;
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      const response = await this.page.goto(`/producto/${slug}/`, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      const status = response?.status() ?? 0;
      if (status === 403) {
        report403();
        await waitForCooldown();
        continue;
      }
      await this.page.waitForLoadState('networkidle').catch(() => {});
      const ready = await this.title.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
      if (ready) return;
      await humanDelay(5_000 * attempt, 8_000 * attempt);
    }
  }

  async getPriceText(): Promise<string> {
    return this.price.textContent().then((t) => t?.trim() ?? '');
  }

  async getTitleText(): Promise<string> {
    return this.title.textContent().then((t) => t?.trim() ?? '');
  }

  async getShortDescription(): Promise<string> {
    return this.shortDescription.textContent().then((t) => t?.trim() ?? '');
  }

  async hasGallery(): Promise<boolean> {
    return this.gallery.isVisible().catch(() => false);
  }

  async getThumbnailCount(): Promise<number> {
    return this.thumbnails.count();
  }

  async clickThumbnail(index: number): Promise<void> {
    const thumb = this.thumbnails.nth(index);
    await thumb.scrollIntoViewIfNeeded();
    await humanDelay(1_000, 2_000);
    await thumb.click();
    await humanDelay(2_000, 4_000);
  }

  async getVariationCount(): Promise<number> {
    return this.variationButtons.count();
  }

  async isAnyVariationSelected(): Promise<boolean> {
    const count = await this.getVariationCount();
    if (count === 0) return false;
    const activeCount = await this.page.locator('.variation-button.active, .variation-button.selected').count();
    return activeCount > 0;
  }

  async selectFirstVariation(): Promise<void> {
    const btn = this.variationButtons.first();
    await btn.scrollIntoViewIfNeeded();
    await humanDelay(1_000, 2_000);
    await btn.click();
    await humanDelay(2_000, 4_000);
  }

  async isAddToCartEnabled(): Promise<boolean> {
    return this.addToCartButton.evaluate((el) => {
      const b = el as HTMLButtonElement;
      return (
        !b.disabled &&
        !b.classList.contains('disabled') &&
        !b.classList.contains('wc-variation-is-unavailable') &&
        !b.classList.contains('wc-variation-selection-needed')
      );
    });
  }

  async clickAddToCart(): Promise<void> {
    await this.addToCartButton.scrollIntoViewIfNeeded();
    await humanDelay(1_500, 3_000);
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('cart') || resp.url().includes('add-to-cart'),
      { timeout: 20_000 },
    ).catch(() => null);
    await this.addToCartButton.click();
    await responsePromise;
    await humanDelay(3_000, 5_000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clickBuyNow(): Promise<void> {
    const link = this.page.locator('.buy_now_button a, .buy_now_link').first();
    await link.scrollIntoViewIfNeeded();
    await humanDelay(1_500, 3_000);
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getCartBadgeCount(): Promise<number> {
    const text = await this.cartBadge.textContent().catch(() => '0');
    return parseInt(text?.trim() ?? '0', 10) || 0;
  }

  async isWooMessageVisible(): Promise<boolean> {
    return this.wooMessage.isVisible().catch(() => false);
  }

  async getWooMessageText(): Promise<string> {
    return this.wooMessage.textContent().then((t) => t?.trim() ?? '');
  }

  async isOnCartPage(): Promise<boolean> {
    return /\/carrito/.test(this.page.url());
  }

  async getQuantityValue(): Promise<number> {
    const val = await this.quantityInput.inputValue();
    return parseInt(val, 10) || 1;
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
    await humanDelay(500, 1_000);
  }
}

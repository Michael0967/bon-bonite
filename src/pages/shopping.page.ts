import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick } from '../support/humanize';
import { waitForCooldown, report403 } from '../support/circuit-breaker';
import { throttleNavigation, throttleAction } from '../support/rate-limiter';

export class ShoppingPage {
  private readonly page: Page;
  private productCard!: Locator;
  private colorThumbnailStrip!: Locator;
  private colorThumbnails!: Locator;
  private mainImage!: Locator;
  private mainImageSrcBefore = '';
  private productHref = '';

  constructor(page: Page) {
    this.page = page;
  }

  async warmUp(): Promise<void> {
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      const response = await this.page.goto('/', {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      const status = response?.status() ?? 0;
      if (status === 403) {
        report403();
        await waitForCooldown();
        continue;
      }
      if (status !== 403) {
        await this.page.waitForLoadState('networkidle').catch(() => {});
        return;
      }
      await humanDelay(5_000 * attempt, 10_000 * attempt);
    }
  }

  async openCategory(): Promise<void> {
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        await humanDelay(5_000, 10_000);
      }

      const menuLink = this.page.locator('#menu-item-10 > a');
      const isVisible = await menuLink.isVisible().catch(() => false);
      if (!isVisible) {
        const parentItems = this.page.locator('ul#menu-main-menu > li, nav ul > li');
        const parentCount = await parentItems.count();
        for (let i = 0; i < parentCount; i++) {
          const text = await parentItems.nth(i).textContent().catch(() => '');
          if (text?.includes('Zapatos')) {
            await parentItems.nth(i).hover();
            await humanDelay(1_500, 3_000);
            break;
          }
        }
      }

      await menuLink.scrollIntoViewIfNeeded().catch(() => {});
      await humanDelay(1_000, 2_000);

      try {
        await menuLink.click({ timeout: 10_000 });
      } catch {
        const response = await this.page.goto('/categoria-producto/zapatos-mujer/', {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });
        if (response?.status() === 403) {
          report403();
          await waitForCooldown();
          continue;
        }
      }

      const loaded = await this.page
        .waitForURL(/categoria-producto\/zapatos-mujer/, { timeout: 12_000 })
        .then(async () => {
          await this.page.waitForLoadState('domcontentloaded');
          return true;
        })
        .catch(() => false);

      if (loaded) {
        const hasProducts = await this.page
          .locator('.product-wrapper-with-variation')
          .first()
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
        if (hasProducts) return;
      }

      if (attempt < maxAttempts) {
        await this.page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await humanDelay(2_000, 4_000);
      }
    }

    throw new Error(
      `Zapatos category did not load after ${maxAttempts} attempts.`,
    );
  }

  async findProductCard(productName: string): Promise<void> {
    const slug = productName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    this.productHref = `/producto/${slug}/`;

    const productLink = this.page.locator(`a[href*="${slug}"]`).first();
    const visible = await productLink.isVisible({ timeout: 8_000 }).catch(() => false);

    if (!visible) {
      const response = await this.page.goto(this.productHref, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      if (response?.status() === 403) {
        report403();
        await waitForCooldown();
      }
      await this.page.waitForLoadState('networkidle').catch(() => {});
      this.mainImage = this.page.locator('.woocommerce-product-gallery__image img, .product img').first();
      return;
    }

    await productLink.scrollIntoViewIfNeeded();
    await humanDelay(1_000, 2_000);

    this.productHref = await productLink.getAttribute('href') ?? this.productHref;
    this.productCard = productLink.locator('..');
    this.mainImage = this.productCard.locator('a img, img').first();

    this.colorThumbnails = this.page.locator('.color-thumbnail');
    this.colorThumbnailStrip = this.colorThumbnails.first().locator('..').locator('..');
  }

  async hoverProductCard(): Promise<void> {
    this.mainImageSrcBefore = await this.mainImage.getAttribute('src') ?? '';
    await this.productCard.hover();
    await humanDelay(2_000, 4_000);
  }

  async isColorThumbnailStripVisible(): Promise<boolean> {
    const thumbCount = await this.colorThumbnails.count();
    if (thumbCount === 0) return false;

    const stripOpacity = await this.colorThumbnailStrip.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return parseFloat(styles.opacity);
    }).catch(() => 0);
    if (stripOpacity > 0) return true;

    const anyVisible = await this.colorThumbnails.first().isVisible().catch(() => false);
    return anyVisible;
  }

  async clickColorThumbnail(index: number): Promise<void> {
    const thumb = this.colorThumbnails.nth(index);
    await thumb.scrollIntoViewIfNeeded();
    await humanDelay(1_000, 2_000);
    await thumb.locator('a').first().click({ force: true });
    await humanDelay(3_000, 5_000);
  }

  async didMainImageChange(): Promise<boolean> {
    const newSrc = await this.page.locator('.product-wrapper-with-variation img').first()
      .getAttribute('src')
      .catch(() => null);
    if (!newSrc) return false;
    return newSrc !== this.mainImageSrcBefore;
  }

  async clickProductCardLink(): Promise<void> {
    if (this.page.url().includes('/producto/')) {
      return;
    }
    const link = this.page.locator(`a[href*="${this.productHref}"]`).first();
    const visible = await link.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!visible) {
      const response = await this.page.goto(this.productHref, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      });
      if (response?.status() === 403) {
        report403();
        await waitForCooldown();
      }
      await this.page.waitForLoadState('networkidle').catch(() => {});
      return;
    }
    await link.click({ timeout: 12_000 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isOnProductPage(): Promise<boolean> {
    return this.page.url().includes('/producto/');
  }

  async getProductPageUrl(): Promise<string> {
    return this.page.url();
  }

  async getExpectedProductUrl(): Promise<string> {
    return this.productHref;
  }

  async getProductTitle(): Promise<string> {
    return this.page.locator('h1.product_title, .product_title').first()
      .textContent()
      .then((t) => t?.trim() ?? '');
  }

  async getVisibleVariantCount(): Promise<number> {
    return this.page.locator('.variation-button').count();
  }

  async isAnyVariantPreselected(): Promise<boolean> {
    const count = await this.getVisibleVariantCount();
    if (count === 0) return false;
    const activeCount = await this.page.locator('.variation-button.active, .variation-button.selected').count();
    return activeCount > 0;
  }

  async isAddToCartButtonEnabled(): Promise<boolean> {
    const btn = this.page.locator('.single_add_to_cart_button');
    return btn.evaluate((el) => {
      const b = el as HTMLButtonElement;
      return (
        !b.disabled &&
        !b.classList.contains('disabled') &&
        !b.classList.contains('wc-variation-is-unavailable') &&
        !b.classList.contains('wc-variation-selection-needed')
      );
    });
  }

  async selectFirstVariant(): Promise<void> {
    const btn = this.page.locator('.variation-button').first();
    await btn.scrollIntoViewIfNeeded();
    await humanDelay(1_000, 2_000);
    await btn.click();
    await humanDelay(2_000, 4_000);
  }

  async clickBuyNow(): Promise<void> {
    const link = this.page.locator('.buy_now_link, .buy_now_button a').first();
    await link.scrollIntoViewIfNeeded();
    await humanDelay(1_500, 3_000);
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clickAddToCart(): Promise<void> {
    const btn = this.page.locator('.single_add_to_cart_button');
    await btn.scrollIntoViewIfNeeded();
    await humanDelay(1_500, 3_000);

    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('cart') || resp.url().includes('add-to-cart'),
      { timeout: 20_000 },
    ).catch(() => null);

    await btn.click();
    await responsePromise;
    await humanDelay(3_000, 5_000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async isOnCartPage(): Promise<boolean> {
    return /\/carrito/.test(this.page.url());
  }

  async getCartBadgeCount(): Promise<number> {
    const badge = this.page.locator('.cart-contents-count').first();
    const text = await badge.textContent().catch(() => '0');
    return parseInt(text?.trim() ?? '0', 10) || 0;
  }

  async isWooMessageVisible(): Promise<boolean> {
    return this.page.locator('.woocommerce-message').isVisible().catch(() => false);
  }

  async getWooMessageText(): Promise<string> {
    return this.page.locator('.woocommerce-message').textContent()
      .then((t) => t?.trim() ?? '');
  }
}

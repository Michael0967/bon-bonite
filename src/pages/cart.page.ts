import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick, humanType } from '../support/humanize';
import { waitForCooldown, report403 } from '../support/circuit-breaker';
import { throttleNavigation, throttleAction } from '../support/rate-limiter';

export class CartPage {
  readonly cartForm: Locator;
  readonly emptyMessage: Locator;
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly updateCartButton: Locator;
  readonly proceedToCheckout: Locator;
  readonly subtotal: Locator;
  readonly total: Locator;

  private cartItems!: Locator;

  constructor(private readonly page: Page) {
    this.cartForm = page.locator('.woocommerce-cart-form').first();
    this.emptyMessage = page.locator('.wc-empty-cart-message, .cart-empty').first();
    this.couponInput = page.locator('#coupon_code').first();
    this.applyCouponButton = page.locator('button[name="apply_coupon"]').first();
    this.updateCartButton = page.locator('button[name="update_cart"]').first();
    this.proceedToCheckout = page.locator('.checkout-button, .wc-proceed-to-checkout a').first();
    this.subtotal = page.locator('.cart-subtotal .amount').first();
    this.total = page.locator('.order-total .amount').first();
    this.cartItems = page.locator('.woocommerce-cart-form .cart_item');
  }

  async open(): Promise<void> {
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      const response = await this.page.goto('/carrito/', {
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
      const ready = await this.page
        .locator('.woocommerce-cart-form, .wc-empty-cart-message, .cart-empty')
        .first()
        .waitFor({ state: 'visible', timeout: 8_000 })
        .then(() => true)
        .catch(() => false);
      if (ready) return;
      await humanDelay(5_000 * attempt, 8_000 * attempt);
    }
  }

  async isCartEmpty(): Promise<boolean> {
    return this.emptyMessage.isVisible().catch(() => false);
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getProductName(index = 0): Promise<string> {
    return this.cartItems.nth(index).locator('.product-name').textContent().then((t) => t?.trim() ?? '');
  }

  async getProductQuantity(index = 0): Promise<number> {
    const val = await this.cartItems.nth(index).locator('input.qty').inputValue();
    return parseInt(val, 10) || 1;
  }

  async setProductQuantity(qty: number, index = 0): Promise<void> {
    await this.cartItems.nth(index).locator('input.qty').fill(String(qty));
    await humanDelay(500, 1_000);
  }

  async removeProduct(index = 0): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    const removeBtn = this.cartItems.nth(index).locator('.product-remove .remove, a.remove');
    await removeBtn.click();
    await humanDelay(3_000, 5_000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async updateCart(): Promise<void> {
    await humanClick(this.updateCartButton);
    await humanDelay(3_000, 5_000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getSubtotalText(): Promise<string> {
    return this.subtotal.textContent().then((t) => t?.trim() ?? '');
  }

  async getTotalText(): Promise<string> {
    return this.total.textContent().then((t) => t?.trim() ?? '');
  }

  async applyCoupon(code: string): Promise<void> {
    await humanType(this.couponInput, code);
    await humanDelay(500, 1_000);
    await humanClick(this.applyCouponButton);
    await humanDelay(3_000, 5_000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getCouponErrorText(): Promise<string> {
    const error = this.page.locator('.woocommerce-error, .woocommerce-message').first();
    return error.textContent().then((t) => t?.trim() ?? '');
  }

  async goToCheckout(): Promise<void> {
    await humanClick(this.proceedToCheckout);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}

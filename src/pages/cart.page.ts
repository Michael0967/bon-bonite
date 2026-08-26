import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick } from '../support/humanize';
import { report403, reportSuccess, waitForCooldown } from '../support/circuit-breaker';
import { throttleNavigation, throttleAction } from '../support/rate-limiter';

export class CartPage {
  readonly cartForm: Locator;
  readonly emptyMessage: Locator;
  readonly updateCartButton: Locator;
  readonly proceedToCheckout: Locator;
  readonly subtotal: Locator;
  readonly total: Locator;

  private cartItems!: Locator;

  constructor(private readonly page: Page) {
    this.cartForm = page.locator('.woocommerce-cart-form').first();
    this.emptyMessage = page.locator('h1:text("Tu carrito está vacío")').first();
    this.updateCartButton = page.locator('button[name="update_cart"]').first();
    this.proceedToCheckout = page.locator('.checkout-button, .wc-proceed-to-checkout a').first();
    this.subtotal = page.locator('.cart-subtotal .amount').first();
    this.total = page.locator('.order-total .amount').first();
    this.cartItems = page.locator('.woocommerce-cart-form .cart_item');
  }

  async open(): Promise<void> {
    await waitForCooldown();
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      let status = 0;
      try {
        const response = await this.page.goto('/carrito/', {
          waitUntil: 'domcontentloaded',
          timeout: 15_000,
        });
        status = response?.status() ?? 0;
      } catch {
        status = 0;
      }
      if (status === 403) {
        report403();
        await humanDelay(3_000, 5_000);
        continue;
      }
      const ready = await this.page
        .locator('.woocommerce-cart-form, h1:text("Tu carrito está vacío")')
        .first()
        .waitFor({ state: 'visible', timeout: 8_000 })
        .then(() => true)
        .catch(() => false);
      if (ready) {
        reportSuccess();
        return;
      }
      await humanDelay(1_000 * attempt, 2_000 * attempt);
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
    await humanDelay(1_000, 2_000);
  }

  async updateCart(): Promise<void> {
    await humanClick(this.updateCartButton);
    await humanDelay(1_000, 2_000);
  }

  async getSubtotalText(): Promise<string> {
    return this.subtotal.textContent().then((t) => t?.trim() ?? '');
  }

  async getTotalText(): Promise<string> {
    return this.total.textContent().then((t) => t?.trim() ?? '');
  }

  async goToCheckout(): Promise<void> {
    await humanClick(this.proceedToCheckout);
    await this.page.waitForLoadState('domcontentloaded');
  }
}

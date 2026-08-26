import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick, humanType } from '../support/humanize';
import { report403 } from '../support/circuit-breaker';
import { throttleNavigation, throttleAction } from '../support/rate-limiter';

export class CheckoutPage {
  readonly checkoutForm: Locator;
  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingPhone: Locator;
  readonly billingAddress1: Locator;
  readonly billingCity: Locator;
  readonly billingState: Locator;
  readonly billingPostcode: Locator;
  readonly orderReview: Locator;
  readonly orderTotal: Locator;
  readonly paymentMethods: Locator;
  readonly placeOrderButton: Locator;
  readonly couponToggle: Locator;
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly termsCheckbox: Locator;

  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.checkoutForm = page.locator('form.checkout').first();
    this.billingFirstName = page.locator('#billing_first_name').first();
    this.billingLastName = page.locator('#billing_last_name').first();
    this.billingEmail = page.locator('#billing_email').first();
    this.billingPhone = page.locator('#billing_phone').first();
    this.billingAddress1 = page.locator('#billing_address_1').first();
    this.billingCity = page.locator('#billing_city').first();
    this.billingState = page.locator('#billing_state').first();
    this.billingPostcode = page.locator('#billing_postcode').first();
    this.orderReview = page.locator('#order_review').first();
    this.orderTotal = page.locator('#order_total .amount, .order-total .amount').first();
    this.paymentMethods = page.locator('ul.payment_methods').first();
    this.placeOrderButton = page.locator('#place_order').first();
    this.couponToggle = page.locator('.woocommerce-form-coupon-toggle').first();
    this.couponInput = page.locator('.woocommerce-form-coupon #coupon_code, #coupon_code').first();
    this.applyCouponButton = page.locator('.woocommerce-form-coupon button[name="apply_coupon"], button[name="apply_coupon"]').first();
    this.termsCheckbox = page.locator('#terms').first();
  }

  async open(): Promise<void> {
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await throttleNavigation();
      let status = 0;
      try {
        const response = await this.page.goto('/finalizar-compra/', {
          waitUntil: 'domcontentloaded',
          timeout: 15_000,
        });
        status = response?.status() ?? 0;
      } catch {
        status = 0;
      }
      if (status === 403) {
        report403();
        await humanDelay(10_000, 20_000);
        continue;
      }
      const onEmptyCart = await this.page.locator('.cart-empty, .wc-empty-cart-message').isVisible().catch(() => false);
      if (onEmptyCart) return;

      const ready = await this.checkoutForm.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
      if (ready) return;
      await humanDelay(5_000 * attempt, 8_000 * attempt);
    }
  }

  async isCartEmptyOnCheckout(): Promise<boolean> {
    return this.page.locator('.cart-empty, .wc-empty-cart-message').isVisible().catch(() => false);
  }

  async hasCheckoutForm(): Promise<boolean> {
    return this.checkoutForm.isVisible().catch(() => false);
  }

  async fillBillingField(field: 'firstName' | 'lastName' | 'email' | 'phone' | 'address1' | 'city' | 'postcode', value: string): Promise<void> {
    const map: Record<string, Locator> = {
      firstName: this.billingFirstName,
      lastName: this.billingLastName,
      email: this.billingEmail,
      phone: this.billingPhone,
      address1: this.billingAddress1,
      city: this.billingCity,
      postcode: this.billingPostcode,
    };
    const locator = map[field];
    if (!locator) return;
    await throttleAction();
    await locator.fill('');
    await humanDelay(300, 700);
    await humanType(locator, value);
    await humanDelay(1_000, 2_000);
  }

  async fillBillingState(value: string): Promise<void> {
    await throttleAction();
    await this.billingState.selectOption(value).catch(() => {});
    await humanDelay(1_000, 2_000);
  }

  async getOrderItems(): Promise<string[]> {
    const items = this.page.locator('.woocommerce-checkout-review-order-table .product-name');
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  async getOrderTotalText(): Promise<string> {
    return this.orderTotal.textContent().then((t) => t?.trim() ?? '');
  }

  async hasPaymentMethods(): Promise<boolean> {
    return this.paymentMethods.isVisible().catch(() => false);
  }

  async getPaymentMethodCount(): Promise<number> {
    return this.page.locator('ul.payment_methods > li.payment_method').count();
  }

  async isWompiVisible(): Promise<boolean> {
    const wompi = this.page.locator('input[name="payment_method"][value*="wompi"], .payment_method_wompi');
    return wompi.isVisible().catch(() => false);
  }

  async getSubtotalText(): Promise<string> {
    const el = this.page.locator('.cart-subtotal .amount, .woocommerce-checkout-review-order-table .cart-subtotal .amount').first();
    return el.textContent().then((t) => t?.trim() ?? '');
  }

  async applyCoupon(code: string): Promise<void> {
    if (await this.couponToggle.isVisible().catch(() => false)) {
      await humanClick(this.couponToggle);
      await humanDelay(500, 1_000);
    }
    await humanType(this.couponInput, code);
    await humanDelay(500, 1_000);
    await humanClick(this.applyCouponButton);
    await humanDelay(3_000, 5_000);
  }

  async getCouponMessageText(): Promise<string> {
    const msg = this.page.locator('.woocommerce-error, .woocommerce-message').first();
    return msg.textContent().then((t) => t?.trim() ?? '');
  }
}

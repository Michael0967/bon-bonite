import type { Locator, Page } from '@playwright/test';
import { humanDelay, humanClick, humanType } from '../support/humanize';
import { report403, reportSuccess, waitForCooldown } from '../support/circuit-breaker';
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
  readonly billingDocumentType: Locator;
  readonly billingGender: Locator;
  readonly billingCountry: Locator;
  readonly orderReview: Locator;
  readonly orderTotal: Locator;
  readonly placeOrderButton: Locator;
  readonly continueButton: Locator;
  readonly cartSummary: Locator;
  readonly orderDetails: Locator;

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
    this.billingDocumentType = page.locator('#billing_tipo_documento').first();
    this.billingGender = page.locator('#billing_gender').first();
    this.billingCountry = page.locator('#billing_country').first();
    this.placeOrderButton = page.locator('#place_order').first();
    this.continueButton = page.locator('.resume-cta[data-step="step2"]').first();
    this.cartSummary = page.locator('.step.active .order-review-wrapper').first();
    this.orderDetails = page.locator('.order_details').first();
    this.orderTotal = page.locator('.order-total-row .amount').first();
  }

  async open(): Promise<void> {
    await waitForCooldown();
    const maxAttempts = 3;
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
        await humanDelay(3_000, 5_000);
        continue;
      }
      const ready = await this.checkoutForm.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
      if (ready) {
        reportSuccess();
        return;
      }
      await humanDelay(1_000 * attempt, 2_000 * attempt);
    }
  }

  async hasCheckoutForm(): Promise<boolean> {
    return this.checkoutForm.isVisible().catch(() => false);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.scrollIntoViewIfNeeded();
    await humanDelay(500, 1_000);
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => {}),
      humanClick(this.continueButton),
    ]);
    await humanDelay(2_000, 4_000);
  }

  async hasBillingForm(): Promise<boolean> {
    return this.billingFirstName.isVisible().catch(() => false);
  }

  async fillBillingField(field: 'firstName' | 'lastName' | 'email' | 'phone' | 'address1' | 'postcode', value: string): Promise<void> {
    const map: Record<string, Locator> = {
      firstName: this.billingFirstName,
      lastName: this.billingLastName,
      email: this.billingEmail,
      phone: this.billingPhone,
      address1: this.billingAddress1,
      postcode: this.billingPostcode,
    };
    const locator = map[field];
    if (!locator) return;
    await throttleAction();
    await locator.fill('');
    await humanDelay(300, 700);
    await humanType(locator, value);
    await humanDelay(500, 1_000);
  }

  async getOrderItems(): Promise<string[]> {
    const items = this.page.locator('.step.active .order-review-body .product-name');
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

  async getSubtotalText(): Promise<string> {
    const el = this.page.locator('.step.active .totals-row .amount').first();
    return el.textContent().then((t) => t?.trim() ?? '');
  }

  async hasPlaceOrderButton(): Promise<boolean> {
    return this.placeOrderButton.isVisible().catch(() => false);
  }

  async acceptTerms(): Promise<void> {
    const checkbox = this.page.locator('#terms').first();
    await checkbox.scrollIntoViewIfNeeded();
    await checkbox.check({ force: true });
    await humanDelay(500, 1_000);
  }

  async clickPlaceOrder(): Promise<void> {
    await this.placeOrderButton.scrollIntoViewIfNeeded();
    await humanDelay(500, 1_000);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {}),
      this.placeOrderButton.click({ force: true }),
    ]);
    await humanDelay(5_000, 8_000);
  }

  async isOrderConfirmationVisible(): Promise<boolean> {
    return this.orderDetails.isVisible().catch(() => false);
  }

  async getOrderNumber(): Promise<string> {
    const el = this.page.locator('.order_details .order strong').first();
    return el.textContent().then((t) => t?.trim() ?? '');
  }

  async getOrderTotalText(): Promise<string> {
    return this.orderTotal.textContent().then((t) => t?.trim() ?? '');
  }

  async getOrderPaymentMethod(): Promise<string> {
    const el = this.page.locator('.order_details .method strong').first();
    return el.textContent().then((t) => t?.trim() ?? '');
  }

  async getConfirmationTotalText(): Promise<string> {
    const el = this.page.locator('.order_details .total strong').first();
    return el.textContent().then((t) => t?.trim() ?? '');
  }

  async hasLoginForm(): Promise<boolean> {
    return this.page.locator('form.woocommerce-form-login #username').isVisible().catch(() => false);
  }

  async loginInCheckout(idNumber: string, password: string): Promise<boolean> {
    await this.page.evaluate(({ id, pw }) => {
      const form = document.querySelector('form.woocommerce-form-login') as HTMLFormElement | null;
      if (!form) return;
      const usernameEl = form.querySelector('#username') as HTMLInputElement | null;
      const passwordEl = form.querySelector('#password') as HTMLInputElement | null;
      if (usernameEl) { usernameEl.value = id; usernameEl.dispatchEvent(new Event('input', { bubbles: true })); }
      if (passwordEl) { passwordEl.value = pw; passwordEl.dispatchEvent(new Event('input', { bubbles: true })); }
    }, { id: idNumber, pw: password });
    await humanDelay(500, 1_000);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => {}),
      this.page.evaluate(() => {
        const form = document.querySelector('form.woocommerce-form-login') as HTMLFormElement | null;
        form?.requestSubmit();
      }),
    ]);
    await humanDelay(3_000, 5_000);
    return this.page.url().includes('step=2');
  }

  async hasOrderConfirmation(): Promise<boolean> {
    return this.orderDetails.isVisible().catch(() => false);
  }
}

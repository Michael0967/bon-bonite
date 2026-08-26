import { Given } from '@cucumber/cucumber';
import { productPage } from '../support/product-page';
import type { BonboniteWorld } from '../support/world';

const PRODUCT_SLUG = 'baleta-con-taches-en-cuero-capuccino';

Given(
  'a product is in the cart',
  { timeout: 120_000 },
  async function (this: BonboniteWorld): Promise<void> {
    await productPage(this).openAndAddToCart(PRODUCT_SLUG);
  },
);

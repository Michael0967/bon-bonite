import { CheckoutPage } from '../pages/checkout.page';
import type { BonboniteWorld } from './world';

export function checkoutPage(world: BonboniteWorld): CheckoutPage {
  if (!world.userData.checkoutPage) {
    world.userData.checkoutPage = new CheckoutPage(world.page);
  }
  return world.userData.checkoutPage as CheckoutPage;
}

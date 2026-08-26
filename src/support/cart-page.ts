import { CartPage } from '../pages/cart.page';
import type { BonboniteWorld } from './world';

export function cartPage(world: BonboniteWorld): CartPage {
  if (!world.userData.cartPage) {
    world.userData.cartPage = new CartPage(world.page);
  }
  return world.userData.cartPage as CartPage;
}

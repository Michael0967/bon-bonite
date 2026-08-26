import { ProductPage } from '../pages/product.page';
import type { BonboniteWorld } from './world';

export function productPage(world: BonboniteWorld): ProductPage {
  if (!world.userData.productPage) {
    world.userData.productPage = new ProductPage(world.page);
  }
  return world.userData.productPage as ProductPage;
}

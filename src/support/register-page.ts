import { RegisterPage } from '../pages/register.page';
import type { BonboniteWorld } from './world';

export function registerPage(world: BonboniteWorld): RegisterPage {
  if (!world.userData.registerPage) {
    world.userData.registerPage = new RegisterPage(world.page);
  }
  return world.userData.registerPage as RegisterPage;
}

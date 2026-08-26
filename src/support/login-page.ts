import { LoginPage } from '../pages/login.page';
import type { BonboniteWorld } from './world';

export function loginPage(world: BonboniteWorld): LoginPage {
  if (!world.userData.loginPage) {
    world.userData.loginPage = new LoginPage(world.page);
  }
  return world.userData.loginPage as LoginPage;
}

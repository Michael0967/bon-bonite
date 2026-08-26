import { EditAccountPage } from '../pages/edit-account.page';
import type { BonboniteWorld } from './world';

export function editPage(world: BonboniteWorld): EditAccountPage {
  if (!world.userData.editPage) {
    world.userData.editPage = new EditAccountPage(world.page);
  }
  return world.userData.editPage as EditAccountPage;
}

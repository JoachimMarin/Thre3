import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import ObjectTag from 'Constants/ObjectTag';
import GridObjectStaticImage from 'GameObjects/BaseClasses/GridObjectStaticImage';
import DynamicState from 'Level/DynamicState';
import StaticState from 'Level/StaticState';
import { IVec2 } from 'Math/GridPoint';

export default class DirtWall extends GridObjectStaticImage {
  static tags = new Set<ObjectTag>([
    ObjectTag.CONDITIONAL_WALL,
    ObjectTag.DESTROY_BULLETS
  ]);
  static imageKey = 'dirt_wall';

  constructor(state: StaticState, aPoint: IVec2) {
    super(state, aPoint, DirtWall.imageKey);
    this.PostConstructStatic(state);
  }

  override HasTag(_state: DynamicState, tag: ObjectTag) {
    return DirtWall.tags.has(tag);
  }

  override IsWall(state: DynamicState): boolean {
    return !state.inventory.HasItem(ItemDefinitions.SHOVEL);
  }

  override OnBeginStep(state: DynamicState, _trigger: boolean): void {
    if (state.player.destination.Equals(this.position)) {
      state.inventory.RemoveItem(ItemDefinitions.SHOVEL);
      this.Remove(state);
    }
  }
}

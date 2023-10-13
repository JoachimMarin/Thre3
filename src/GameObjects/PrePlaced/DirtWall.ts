import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import ObjectTag from 'Constants/ObjectTag';
import GridObjectStatic from 'GameObjects/BaseClasses/GridObjectStatic';
import LevelState, { StaticState } from 'LevelScene/LevelState';
import { IVec2 } from 'Math/GridPoint';

export default class DirtWall extends GridObjectStatic {
  static tags = new Set<ObjectTag>([
    ObjectTag.CONDITIONAL_WALL,
    ObjectTag.DESTROY_BULLETS
  ]);
  static imageKey = 'dirt_wall';

  constructor(state: StaticState, point: IVec2) {
    super(state, point);
  }

  override HasTag(_state: LevelState, tag: ObjectTag) {
    return DirtWall.tags.has(tag);
  }

  override IsWall(state: LevelState): boolean {
    return !state.inventory.HasItem(ItemDefinitions.SHOVEL);
  }

  override OnBeginStep(state: LevelState, _trigger: boolean): void {
    if (state.player.destination.Equals(this.position)) {
      state.inventory.RemoveItem(ItemDefinitions.SHOVEL);
      this.Remove(state);
    }
  }
}

import ObjectTag from 'Headless/Level/GameObjects/ObjectTag';
import GridObjectStaticImage from 'Headless/Level/GameObjects/BaseClasses/GridObjectStaticImage';
import DynamicState from 'Headless/Level/GameState/DynamicState';
import { IVec2 } from 'Headless/Utils/Math/GridPoint';
import StaticState from 'Headless/Level/GameState/StaticState';
import ItemDefinitions from 'Headless/Level/Generation/AssetDefinitions/ItemDefinitions';

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

import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import ObjectTag from 'Constants/ObjectTag';
import GridObjectStatic from 'GameObjects/BaseClasses/GridObjectStatic';
import LevelState from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';

export default class DirtWall extends GridObjectStatic {
  public image: Phaser.GameObjects.Image;
  static tags = new Set<ObjectTag>([
    ObjectTag.CONDITIONAL_WALL,
    ObjectTag.DESTROY_BULLETS
  ]);
  static imageKey = 'dirt_wall';

  constructor(state: LevelState, aPoint: IVec2) {
    super(state, aPoint);
    this.PostConstructStatic(state);
    if (!state.virtual) {
      const point = Vec2.AsVec2(aPoint);
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        DirtWall.imageKey
      );
      this.image.setDisplaySize(1, 1);
    }
  }

  override HasTag(_state: LevelState, tag: ObjectTag) {
    return DirtWall.tags.has(tag);
  }

  override OnRemove(state: LevelState) {
    if (!state.virtual) {
      this.image.destroy();
    }
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

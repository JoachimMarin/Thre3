import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';
import ItemType from 'Constants/ItemType';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GridObjectStatic from 'GameObjects/BaseClasses/GridObjectStatic';

export default class Item extends GridObjectStatic {
  public image: Phaser.GameObjects.Image;
  static tags = new Set<ObjectTag>([ObjectTag.ITEM]);

  public readonly itemType: ItemType;

  constructor(state: LevelState, aPoint: IVec2, itemType: ItemType) {
    super(state, aPoint);
    this.itemType = itemType;
    this.PostConstructStatic(state);
    if (!state.virtual) {
      const point = Vec2.AsVec2(aPoint);
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        itemType.imageKey
      );
      this.image.setDisplaySize(1, 1);
    }
  }

  override HasTag(_state: LevelState, tag: ObjectTag) {
    return Item.tags.has(tag);
  }

  override OnRemove(state: LevelState) {
    if (!state.virtual) {
      this.image.destroy();
    }
  }
}

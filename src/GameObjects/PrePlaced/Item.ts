import ObjectTag from 'Constants/ObjectTag';
import LevelState, { StaticState } from 'LevelScene/LevelState';
import ItemType from 'Constants/ItemType';
import { IVec2 } from 'Math/GridPoint';
import GridObjectStatic from 'GameObjects/BaseClasses/GridObjectStatic';

export default class Item extends GridObjectStatic {
  static tags = new Set<ObjectTag>([ObjectTag.ITEM]);

  public readonly itemType: ItemType;

  constructor(state: StaticState, point: IVec2, itemType: ItemType) {
    super(state, point);
    this.itemType = itemType;
  }

  override HasTag(_state: LevelState, tag: ObjectTag) {
    return Item.tags.has(tag);
  }
}

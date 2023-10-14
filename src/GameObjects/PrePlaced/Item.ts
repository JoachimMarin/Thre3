import ObjectTag from 'Constants/ObjectTag';
import DynamicState from 'Level/DynamicState';
import ItemType from 'Constants/ItemType';
import { IVec2 } from 'Math/GridPoint';
import GridObjectStaticImage from 'GameObjects/BaseClasses/GridObjectStaticImage';
import StaticState from 'Level/StaticState';

export default class Item extends GridObjectStaticImage {
  static tags = new Set<ObjectTag>([ObjectTag.ITEM]);

  public readonly itemType: ItemType;

  constructor(state: StaticState, aPoint: IVec2, itemType: ItemType) {
    super(state, aPoint, itemType.imageKey);
    this.itemType = itemType;
    this.PostConstructStatic(state);
  }

  override HasTag(_state: DynamicState, tag: ObjectTag) {
    return Item.tags.has(tag);
  }
}

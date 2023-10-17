import ObjectTag from 'Game/Level/GameObjects/ObjectTag';
import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2 } from 'Utils/Math/GridPoint';
import GridObjectStaticImage from 'Game/Level/GameObjects/BaseClasses/GridObjectStaticImage';
import ItemType from 'Game/Level/Generation/AssetLoading/ItemType';
import StaticState from 'Game/Level/GameState/StaticState';

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

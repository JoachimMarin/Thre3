import ObjectTag from 'Headless/Level/GameObjects/ObjectTag';
import DynamicState from 'Headless/Level/GameState/DynamicState';
import { IVec2 } from 'Headless/Utils/Math/GridPoint';
import GridObjectStaticImage from 'Headless/Level/GameObjects/BaseClasses/GridObjectStaticImage';
import ItemType from 'Headless/Level/Generation/AssetLoading/ItemType';
import StaticState from 'Headless/Level/GameState/StaticState';

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

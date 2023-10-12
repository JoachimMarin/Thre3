import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';
import ItemType from 'Constants/ItemType';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import { IVec2 } from 'Math/GridPoint';

export default class Item extends GridObjectImage {
  static tags = new Set<ObjectTag>([ObjectTag.ITEM]);

  public readonly itemType: ItemType;

  constructor(point: IVec2, grid: LevelState, itemType: ItemType) {
    super(point, grid, itemType.imageKey);

    this.itemType = itemType;
    this.PostConstruct();
  }

  override GetStaticTags(): Set<ObjectTag> {
    return Item.tags;
  }

  override DeepCopy(state: LevelState) {
    return new Item(this.position, state, this.itemType);
  }
}

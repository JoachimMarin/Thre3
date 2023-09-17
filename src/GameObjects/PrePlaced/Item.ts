import ObjectTag from 'Constants/ObjectTag';
import LevelGrid from 'LevelScene/LevelGrid';
import ItemType from 'Constants/ItemType';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import { IVec2 } from 'Math/GridPoint';

export default class Item extends GridObjectImage {
  public readonly itemType: ItemType;

  constructor(point: IVec2, grid: LevelGrid, itemType: ItemType) {
    super(point, grid, itemType.imageKey);

    this.itemType = itemType;
  }

  OnInit(): void {
    this.AddTag(ObjectTag.ITEM);
  }
}

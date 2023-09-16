import ObjectTag from 'Constants/ObjectTag';
import LevelGrid from 'LevelGrid';
import ItemType from 'Constants/ItemType';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import { IGridPoint } from 'Math/GridPoint';

export default class Item extends GridObjectImage {
  public readonly itemType: ItemType;

  constructor(point: IGridPoint, grid: LevelGrid, itemType: ItemType) {
    super(point, grid, itemType.imageKey);

    this.itemType = itemType;
  }

  OnInit(): void {
    this.AddTag(ObjectTag.ITEM);
  }
}

import ObjectTag from 'Constants/ObjectTag';
import LevelGrid from 'LevelGrid';
import ItemType from 'Constants/ItemType';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';

export default class Item extends GridObjectImage {
  public readonly itemType: ItemType;

  constructor(x: integer, y: integer, grid: LevelGrid, itemType: ItemType) {
    super(x, y, grid, itemType.imageKey);

    this.itemType = itemType;
  }

  OnInit(): void {
    this.AddTag(ObjectTag.ITEM);
  }
}

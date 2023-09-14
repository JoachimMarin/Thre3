import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import ItemType from '../Constants/ItemType';
import GridObjectStatic from './GridObjectStatic';

export default class Item extends GridObjectStatic {
  public image: Phaser.GameObjects.Image;
  public readonly itemType: ItemType;

  constructor(x: integer, y: integer, grid: LevelGrid, itemType: ItemType) {
    super(x, y, grid, itemType.imageKey);

    this.itemType = itemType;
  }

  OnInit(): void {
    this.AddGridTag(GridTags.ITEM);
  }
}

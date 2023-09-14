import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import GridObject from './GridObject';
import ItemType from '../Constants/ItemType';

export default class Item extends GridObject {
  public image: Phaser.GameObjects.Image;
  public readonly itemType: ItemType;

  constructor(x: integer, y: integer, grid: LevelGrid, itemType: ItemType) {
    super(x, y, grid);

    this.itemType = itemType;

    this.image = grid.levelScene.add.image(
      this.position.realX(),
      this.position.realY(),
      itemType.imageKey
    );
    this.image.setDisplaySize(128, 128);
  }

  Init(): void {
    this.AddGridTag(GridTags.ITEM);
  }

  Remove() {
    this.image.destroy();
    super.Remove();
  }
}

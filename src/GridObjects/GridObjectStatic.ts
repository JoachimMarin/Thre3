import * as Phaser from 'phaser';
import GridObject from './GridObject';
import LevelGrid from '../LevelGrid';
import GridPoint from '../Math/GridPoint';

export default abstract class GridObjectStatic extends GridObject {
  public image: Phaser.GameObjects.Image;

  constructor(x: integer, y: integer, grid: LevelGrid, imageKey: string = '') {
    super(x, y, grid);
    if (imageKey == '' && typeof this['GetImageKey'] === 'function') {
      imageKey = this['GetImageKey']();
    }
    this.image = grid.levelScene.add.image(
      this.position.realX(),
      this.position.realY(),
      imageKey
    );
    this.image.setDisplaySize(128, 128);
  }

  SetGridPosition(position: GridPoint): void {
    super.SetGridPosition(position);
    this.image.setPosition(position.realX(), position.realY());
  }

  OnRemove() {
    this.image.destroy();
  }
}

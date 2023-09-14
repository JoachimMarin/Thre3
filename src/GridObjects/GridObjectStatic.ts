import * as Phaser from 'phaser';
import GridObject from './GridObject';
import LevelGrid from '../LevelGrid';
import GridPoint from '../Math/GridPoint';

export default abstract class GridObjectStatic extends GridObject {
  public image: Phaser.GameObjects.Image;

  constructor(x: integer, y: integer, grid: LevelGrid) {
    super(x, y, grid);
    this.image = grid.levelScene.add.image(
      this.position.realX(),
      this.position.realY(),
      this.GetImageKey()
    );
    this.image.setDisplaySize(128, 128);
  }

  SetGridPosition(position: GridPoint): void {
    super.SetGridPosition(position);
    this.image.setPosition(position.realX(), position.realY());
  }

  Remove() {
    this.image.destroy();
    super.Remove();
  }

  abstract GetImageKey(): string;
}

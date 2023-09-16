import LevelGrid from 'LevelGrid';
import { IGridPoint } from 'Math/GridPoint';
import GameObjectPosition from './GameObjectPosition';

/**
 * GameObjectImage:
 *  create and remove image at grid position (cannot be retrieved from grid)
 */
export default abstract class GameObjectImage extends GameObjectPosition {
  public image: Phaser.GameObjects.Image;

  constructor(
    point: IGridPoint,
    grid: LevelGrid,
    imageKey: string = '',
    sizeX: integer = 128,
    sizeY: integer = 128
  ) {
    super(point, grid);
    if (
      imageKey == '' &&
      typeof (this as unknown).constructor['imageKey'] === 'string'
    ) {
      imageKey = (this as unknown).constructor['imageKey'];
    }
    this.image = grid.levelScene.add.image(
      this.position.realX(),
      this.position.realY(),
      imageKey
    );
    this.image.setDisplaySize(sizeX, sizeY);
  }

  Remove() {
    super.Remove();
    this.image.destroy();
  }

  SetGridPosition(position: IGridPoint) {
    super.SetGridPosition(position);
    this.image.setPosition(this.position.realX(), this.position.realY());
  }
}

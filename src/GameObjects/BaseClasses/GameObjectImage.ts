import LevelGrid from 'LevelScene/LevelGrid';
import { IVec2 } from 'Math/GridPoint';
import GameObjectPosition from './GameObjectPosition';

/**
 * GameObjectImage:
 *  create and remove image at grid position (cannot be retrieved from grid)
 */
export default abstract class GameObjectImage extends GameObjectPosition {
  public image: Phaser.GameObjects.Image;

  constructor(
    point: IVec2,
    grid: LevelGrid,
    imageKey: string = '',
    sizeX: integer = 1,
    sizeY: integer = 1
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

  SetGridPosition(position: IVec2) {
    super.SetGridPosition(position);
    this.image.setPosition(this.position.realX(), this.position.realY());
  }
}

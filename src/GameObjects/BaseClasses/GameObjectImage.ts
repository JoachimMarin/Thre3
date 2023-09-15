import LevelGrid from 'LevelGrid';
import GridPoint from 'Math/GridPoint';
import GameObjectPosition from './GameObjectPosition';

/**
 * GameObjectImage:
 *  create and remove image at grid position (cannot be retrieved from grid)
 */
export default abstract class GameObjectImage extends GameObjectPosition {
  public image: Phaser.GameObjects.Image;

  constructor(
    x: integer,
    y: integer,
    grid: LevelGrid,
    imageKey: string = '',
    sizeX: integer = 128,
    sizeY: integer = 128
  ) {
    super(x, y, grid);
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

  SetGridPosition(position: GridPoint) {
    super.SetGridPosition(position);
    this.image.setPosition(this.position.realX(), this.position.realY());
  }
}

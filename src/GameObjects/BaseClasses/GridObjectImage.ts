import LevelGrid from 'LevelGrid';
import GridPoint from 'Math/GridPoint';
import GridObject from 'GameObjects/BaseClasses/GridObject';

/**
 * GameObjectImage:
 *  create and remove image at grid position (can be retrieved from grid)
 */
export default abstract class GridObjectImage extends GridObject {
  public image: Phaser.GameObjects.Image;
  public position: GridPoint;

  constructor(
    x: integer,
    y: integer,
    grid: LevelGrid,
    imageKey: string = '',
    sizeX: integer = 128,
    sizeY: integer = 128
  ) {
    super(x, y, grid);
    this.position = new GridPoint(x, y);
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

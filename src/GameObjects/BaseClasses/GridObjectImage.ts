import LevelGrid from 'LevelScene/LevelGrid';
import { IVec2 } from 'Math/GridPoint';
import GridObject from 'GameObjects/BaseClasses/GridObject';

/**
 * GameObjectImage:
 *  create and remove image at grid position (can be retrieved from grid)
 */
export default abstract class GridObjectImage extends GridObject {
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

  override SetGridPosition(position: IVec2) {
    super.SetGridPosition(position);
    this.image.setPosition(this.position.realX(), this.position.realY());
  }
}

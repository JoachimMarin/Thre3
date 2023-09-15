import GameObject from './GameObject';
import LevelGrid from 'LevelGrid';
import GridPoint from 'Math/GridPoint';

/**
 * GameObjectPosition:
 *  has position
 */
export default abstract class GameObjectPosition extends GameObject {
  public position: GridPoint;

  constructor(x: integer, y: integer, grid: LevelGrid) {
    super(grid);
    this.position = new GridPoint(x, y);
  }

  SetGridPosition(position: GridPoint) {
    this.position = position;
  }
}

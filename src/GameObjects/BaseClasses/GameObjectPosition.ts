import GameObject from './GameObject';
import LevelGrid from 'LevelGrid';
import { IGridPoint, GridPoint } from 'Math/GridPoint';

/**
 * GameObjectPosition:
 *  has position
 */
export default abstract class GameObjectPosition extends GameObject {
  public position: GridPoint;

  constructor(point: IGridPoint, grid: LevelGrid) {
    super(grid);
    this.position = GridPoint.AsGridPoint(point);
  }

  SetGridPosition(position: IGridPoint) {
    this.position = GridPoint.AsGridPoint(position);
  }
}

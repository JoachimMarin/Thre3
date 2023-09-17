import GameObject from './GameObject';
import LevelGrid from 'LevelScene/LevelGrid';
import { IVec2, Vec2 } from 'Math/GridPoint';

/**
 * GameObjectPosition:
 *  has position
 */
export default abstract class GameObjectPosition extends GameObject {
  public position: Vec2;

  constructor(point: IVec2, grid: LevelGrid) {
    super(grid);
    this.position = Vec2.AsVec2(point);
  }

  SetGridPosition(position: IVec2) {
    this.position = Vec2.AsVec2(position);
  }
}

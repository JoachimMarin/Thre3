import GameObject from './GameObject';
import LevelState from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';

/**
 * GameObjectPosition:
 *  has position
 */
export default abstract class GameObjectPosition extends GameObject {
  public position: Vec2;

  constructor(point: IVec2, grid: LevelState) {
    super(grid);
    this.position = Vec2.AsVec2(point);
  }

  SetGridPosition(position: IVec2) {
    this.position = Vec2.AsVec2(position);
  }
}

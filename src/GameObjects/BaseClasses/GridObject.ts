import LevelState from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GameObject from './GameObject';

/**
 * GridObject
 *  has position in grid and can be retrieved from grid
 */
export default abstract class GridObject extends GameObject {
  public position: Vec2;

  constructor(point: IVec2) {
    super();
    this.position = Vec2.AsVec2(point);
  }

  abstract DeepCopy(state: LevelState): void;

  IsWall(_state: LevelState) {
    return false;
  }

  GetGridPosition(_state: LevelState) {
    return this.position;
  }
}

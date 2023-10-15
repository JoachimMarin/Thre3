import DynamicState from 'Headless/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Headless/Utils/Math/GridPoint';
import GameObject from 'Headless/Level/GameObjects/BaseClasses/GameObject';

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

  abstract DeepCopy(state: DynamicState): void;

  IsWall(_state: DynamicState) {
    return false;
  }

  GetGridPosition(_state: DynamicState) {
    return this.position;
  }
}

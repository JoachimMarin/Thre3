import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';
import GameObject from 'Game/Level/GameObjects/BaseClasses/GameObject';

/**
 * GridObject
 *  has position in grid
 */
export default abstract class GridObject extends GameObject {
  public position: Vec2;

  constructor(point: IVec2) {
    super();
    this.position = Vec2.AsVec2(point);
  }

  /**
   * Returns if the GridObject acts as a wall. This is only used in combination with ObjectTag.CONDITIONAL_WALL.
   * GridObjects with ObjectTag.WALL are always treated as wall.
   * @param _state
   * @returns
   */
  IsWall(_state: DynamicState) {
    return false;
  }

  GetGridPosition(_state: DynamicState): Vec2 {
    return this.position;
  }
}

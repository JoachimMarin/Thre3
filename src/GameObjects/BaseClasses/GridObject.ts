import LevelState from 'LevelScene/LevelState';
import { IVec2 } from 'Math/GridPoint';
import GameObjectPosition from './GameObjectPosition';

/**
 * GridObject
 *  has position in grid and can be retrieved from grid
 */
export default abstract class GridObject extends GameObjectPosition {
  constructor(point: IVec2, state: LevelState) {
    super(point, state);
    this.AddToGrid();
  }

  UpdateGridKey() {
    return true;
  }

  Remove() {
    super.Remove();
    this.RemoveFromGrid();
  }

  private RemoveFromGrid() {
    const objectsAtGridPosition =
      this.grid.at[this.position.x][this.position.y];
    objectsAtGridPosition.delete(this);
    if (this.UpdateGridKey()) {
      this.grid.ComputeGridKey();
    }
  }

  private AddToGrid() {
    const objectsAtGridPosition =
      this.grid.at[this.position.x][this.position.y];
    objectsAtGridPosition.add(this);
    if (this.UpdateGridKey()) {
      this.grid.ComputeGridKey();
    }
  }

  override SetGridPosition(position: IVec2) {
    this.RemoveFromGrid();
    super.SetGridPosition(position);
    this.AddToGrid();
  }

  abstract DeepCopy(state: LevelState): void;

  IsWall() {
    return false;
  }
}

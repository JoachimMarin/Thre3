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
    this.grid.at.get(LevelState.GridKeyPoint(this.position)).delete(this);
    if (this.UpdateGridKey()) {
      this.grid.ComputeGridString();
    }
  }

  private AddToGrid() {
    const gridKey = LevelState.GridKeyPoint(this.position);
    if (!this.grid.at.has(gridKey)) {
      this.grid.at.set(gridKey, new Set<GridObject>());
    }
    this.grid.at.get(gridKey).add(this);

    if (this.UpdateGridKey()) {
      this.grid.ComputeGridString();
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

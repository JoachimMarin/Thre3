import LevelGrid from 'LevelScene/LevelGrid';
import { IVec2 } from 'Math/GridPoint';
import GameObjectPosition from './GameObjectPosition';

/**
 * GridObject
 *  has position in grid and can be retrieved from grid
 */
export default abstract class GridObject extends GameObjectPosition {
  constructor(point: IVec2, grid: LevelGrid) {
    super(point, grid);
    this.AddToGrid();
  }

  Remove() {
    super.Remove();
    this.RemoveFromGrid();
  }

  private RemoveFromGrid() {
    const objectsAtGridPosition =
      this.grid.at[this.position.x][this.position.y];
    objectsAtGridPosition.delete(this);
  }

  private AddToGrid() {
    const objectsAtGridPosition =
      this.grid.at[this.position.x][this.position.y];
    objectsAtGridPosition.add(this);
  }

  override SetGridPosition(position: IVec2) {
    this.RemoveFromGrid();
    super.SetGridPosition(position);
    this.AddToGrid();
  }
}

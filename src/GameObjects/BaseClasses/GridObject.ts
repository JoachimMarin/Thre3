import LevelGrid from 'LevelGrid';
import GridPoint from 'Math/GridPoint';
import GameObjectPosition from './GameObjectPosition';

/**
 * GridObject
 *  has position in grid and can be retrieved from grid
 */
export default abstract class GridObject extends GameObjectPosition {
  public position: GridPoint;

  constructor(x: integer, y: integer, grid: LevelGrid) {
    super(x, y, grid);
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

  SetGridPosition(position: GridPoint) {
    this.RemoveFromGrid();
    super.SetGridPosition(position);
    this.AddToGrid();
  }
}

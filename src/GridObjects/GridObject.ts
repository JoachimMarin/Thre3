import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import GridPoint from '../Math/GridPoint';

export default abstract class GridObject {
  public position: GridPoint;
  public grid: LevelGrid;
  public tags: { [id: string]: boolean } = {};

  constructor(x: integer, y: integer, grid: LevelGrid) {
    this.position = new GridPoint(x, y);
    this.grid = grid;
    this.AddToGrid();
    this.Init();

    this.grid.SetupEventGroups(this);
  }

  Remove() {
    this.grid.ClearEventGroups(this);
    this.RemoveFromGrid();
  }

  RemoveFromGrid() {
    const objectsAtGridPosition =
      this.grid.at[this.position.x][this.position.y];
    objectsAtGridPosition.delete(this);
  }

  AddToGrid() {
    const objectsAtGridPosition =
      this.grid.at[this.position.x][this.position.y];
    objectsAtGridPosition.add(this);
  }

  SetGridPosition(position: GridPoint) {
    this.RemoveFromGrid();
    this.position = position;
    this.AddToGrid();
  }

  Init() {}

  HasGridTag(tag: GridTags) {
    return tag.toString() in this.tags;
  }
  AddGridTag(tag: GridTags) {
    this.tags[tag.toString()] = true;
  }
  RemoveGridTag(tag: GridTags) {
    delete this.tags[tag.toString()];
  }

  OnBeginStep(_trigger: boolean) {}
  OnBeginStepTrigger() {}
  OnEndStep(_trigger: boolean) {}
  OnEndStepTrigger() {}
  OnUpdate(_delta: number) {}
}

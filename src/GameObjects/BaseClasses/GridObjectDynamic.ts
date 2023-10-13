import LevelState from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GridObject from './GridObject';
import ObjectTag from 'Constants/ObjectTag';

export default abstract class GridObjectDynamic extends GridObject {
  public state: LevelState;
  private tags: Set<ObjectTag> | null = null;

  constructor(state: LevelState, point: IVec2) {
    super(point);
    this.state = state;
  }

  private AddToGrid() {
    const gridKey = LevelState.GridKeyPoint(this.position);
    if (!this.state.dynamicObjects.has(gridKey)) {
      this.state.dynamicObjects.set(gridKey, new Set<GridObjectDynamic>());
    }
    this.state.dynamicObjects.get(gridKey).add(this);
  }
  private RemoveFromGrid() {
    const gridKey = LevelState.GridKeyPoint(this.position);
    if (this.state.dynamicObjects.has(gridKey)) {
      this.state.dynamicObjects.get(gridKey).delete(this);
    }
  }

  override Remove(_state: LevelState) {
    this.RemoveFromGrid();
  }
  override HasTag(_state: LevelState, tag: ObjectTag) {
    return this.tags != null && this.tags.has(tag);
  }
  AddTag(tag: ObjectTag) {
    if (this.tags == null) {
      this.tags = new Set<ObjectTag>();
    }
    this.tags.add(tag);
  }
  RemoveTag(tag: ObjectTag) {
    this.tags.delete(tag);
  }

  SetGridPosition(position: IVec2) {
    this.RemoveFromGrid();
    this.position = Vec2.AsVec2(position);
    this.AddToGrid();
  }
}

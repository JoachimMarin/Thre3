import DynamicState from 'Headless/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Headless/Utils/Math/GridPoint';
import GridObject from 'Headless/Level/GameObjects/BaseClasses/GridObject';

export default abstract class GridObjectDynamic extends GridObject {
  public state: DynamicState;

  constructor(state: DynamicState, point: IVec2) {
    super(point);
    this.state = state;
    this.AddToGrid();
  }

  static GetByteArraySize() {
    return 8;
  }

  abstract WriteByteArray(_byteArray: Buffer, _index: integer): void;

  private AddToGrid() {
    const gridKey = DynamicState.GridKeyPoint(this.position);
    if (!this.state.dynamicObjects.has(gridKey)) {
      this.state.dynamicObjects.set(gridKey, new Set<GridObjectDynamic>());
    }
    this.state.dynamicObjects.get(gridKey).add(this);
    this.state.UpdateDynamicsKeyString();
  }
  private RemoveFromGrid() {
    const gridKey = DynamicState.GridKeyPoint(this.position);
    if (this.state.dynamicObjects.has(gridKey)) {
      this.state.dynamicObjects.get(gridKey).delete(this);
      this.state.UpdateDynamicsKeyString();
    }
  }

  override Remove(state: DynamicState) {
    this.state.ClearEventGroups(this);
    this.RemoveFromGrid();
    super.Remove(state);
  }

  SetGridPosition(position: IVec2) {
    this.RemoveFromGrid();
    this.position = Vec2.AsVec2(position);
    this.AddToGrid();
  }
}

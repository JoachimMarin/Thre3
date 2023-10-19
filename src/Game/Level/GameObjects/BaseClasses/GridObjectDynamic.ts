import GridObject from 'Game/Level/GameObjects/BaseClasses/GridObject';
import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';

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

  /**
   * Writes this object's state to the byte array.
   * @param _byteArray
   * @param _index
   */
  abstract WriteByteArray(_byteArray: Uint8Array, _index: integer): void;

  private AddToGrid() {
    const gridKey = this.position.toInt16();
    if (!this.state.dynamicObjects.has(gridKey)) {
      this.state.dynamicObjects.set(gridKey, new Set<GridObjectDynamic>());
    }
    this.state.dynamicObjects.get(gridKey).add(this);
    this.state.UpdateDynamicsKeyString();
  }
  private RemoveFromGrid() {
    const gridKey = this.position.toInt16();
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

  abstract DeepCopy(state: DynamicState): GridObjectDynamic;
}

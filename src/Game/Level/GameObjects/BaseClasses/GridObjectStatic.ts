import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';
import GridObject from 'Game/Level/GameObjects/BaseClasses/GridObject';
import StaticState from 'Game/Level/GameState/StaticState';
import GridObjectChanges from 'Game/Level/GameState/GridObjectChanges';

export default abstract class GridObjectStatic extends GridObject {
  constructor(state: StaticState, point: IVec2) {
    super(point);
    const gridKey = Vec2.AsVec2(point).toInt16();
    const staticState = state;
    if (!staticState.staticObjects.has(gridKey)) {
      staticState.staticObjects.set(gridKey, new Set<GridObjectStatic>());
    }
    staticState.staticObjects.get(gridKey).add(this);
  }

  PostConstructStatic(state: StaticState) {
    state.SetupEventGroups(this);
  }

  override Exists(state: DynamicState) {
    return (
      !state.staticObjectChanges.has(this) ||
      GridObjectChanges.GetFlag(state.staticObjectChanges.get(this), 0) == false
    );
  }
  override Remove(state: DynamicState) {
    if (!state.staticObjectChanges.has(this)) {
      state.staticObjectChanges.set(this, 0);
    }
    state.staticObjectChanges.set(
      this,
      GridObjectChanges.SetFlag(state.staticObjectChanges.get(this), 0, true)
    );
    state.UpdateChangesKeyString();
    super.Remove(state);
  }

  override DeepCopy(_state: DynamicState) {}
}

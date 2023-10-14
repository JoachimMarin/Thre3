import DynamicState from 'Level/DynamicState';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GridObject from './GridObject';
import GridObjectChanges from 'Level/GridObjectChanges';
import StaticState from 'Level/StaticState';

export default abstract class GridObjectStatic extends GridObject {
  constructor(state: StaticState, point: IVec2) {
    super(point);
    const gridKey = DynamicState.GridKeyPoint(Vec2.AsVec2(point));
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
      !state.staticObjectChanges.get(this).disabled
    );
  }
  override Remove(state: DynamicState) {
    if (!state.staticObjectChanges.has(this)) {
      state.staticObjectChanges.set(this, new GridObjectChanges());
    }
    state.staticObjectChanges.get(this).disabled = true;
    state.UpdateChangesKeyString();
    super.Remove(state);
  }

  override DeepCopy(_state: DynamicState) {}
}

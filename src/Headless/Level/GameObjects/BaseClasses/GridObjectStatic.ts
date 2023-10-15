import DynamicState from 'Headless/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Headless/Utils/Math/GridPoint';
import GridObject from 'Headless/Level/GameObjects/BaseClasses/GridObject';
import StaticState from 'Headless/Level/GameState/StaticState';
import GridObjectChanges from 'Headless/Level/GameState/GridObjectChanges';

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

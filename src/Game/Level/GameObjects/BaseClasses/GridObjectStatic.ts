import GridObject from 'Game/Level/GameObjects/BaseClasses/GridObject';
import DynamicState from 'Game/Level/GameState/DynamicState';
import GridObjectChanges from 'Game/Level/GameState/GridObjectChanges';
import StaticState from 'Game/Level/GameState/StaticState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';


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
      !GridObjectChanges.HasFlag(
        state.staticObjectChanges.get(this),
        GridObjectChanges.REMOVED
      )
    );
  }
  override Remove(state: DynamicState) {
    if (!state.staticObjectChanges.has(this)) {
      state.staticObjectChanges.set(this, 0);
    }
    // static objects are not actually removed,
    // but only marked as removed in the DynamicState.
    state.staticObjectChanges.set(
      this,
      GridObjectChanges.SetFlag(
        state.staticObjectChanges.get(this),
        GridObjectChanges.REMOVED,
        true
      )
    );
    state.UpdateChangesKeyString();
    // Does not call super.Remove(), because static objects
    // do not need to be removed from event groups
    // OnRemove is still called, because the objects are
    // still removed from active gameplay.
    this.OnRemove(state);
  }
}

import LevelState from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GridObject from './GridObject';
import GridObjectChanges from 'GameObjects/BaseClasses/GridObjectChanges';

export default abstract class GridObjectStatic extends GridObject {
  constructor(state: LevelState, point: IVec2) {
    super(point);
    const gridKey = LevelState.GridKeyPoint(Vec2.AsVec2(point));
    const staticState = state.staticState;
    if (!staticState.staticObjects.has(gridKey)) {
      staticState.staticObjects.set(gridKey, new Set<GridObjectStatic>());
    }
    staticState.staticObjects.get(gridKey).add(this);
  }

  PostConstructStatic(state: LevelState) {
    state.staticState.SetupEventGroups(this);
    this.OnInit(state);
  }

  Remove(state: LevelState) {
    if (!state.staticObjectChanges.has(this)) {
      state.staticObjectChanges.set(this, new GridObjectChanges());
    }
    state.staticObjectChanges.get(this).disabled = true;
  }

  DeepCopy(_state: LevelState) {}
}

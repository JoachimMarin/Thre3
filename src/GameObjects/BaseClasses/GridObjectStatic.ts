import LevelState, { StaticState } from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GridObject from './GridObject';
import GridObjectChanges from 'GameObjects/BaseClasses/GridObjectChanges';

export default abstract class GridObjectStatic extends GridObject {
  constructor(staticState: StaticState, point: IVec2) {
    super(point);
    const gridKey = LevelState.GridKeyPoint(Vec2.AsVec2(point));
    if (!staticState.staticObjects.has(gridKey)) {
      staticState.staticObjects.set(gridKey, new Set<GridObjectStatic>());
    }
    staticState.staticObjects.get(gridKey).add(this);
  }

  Remove(state: LevelState) {
    if (!state.staticObjectChanges.has(this)) {
      state.staticObjectChanges.set(this, new GridObjectChanges());
    }
    state.staticObjectChanges.get(this).disabled = true;
  }

  DeepCopy(_state: LevelState) {}
}

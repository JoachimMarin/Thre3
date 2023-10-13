import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';

/**
 * GameObject:
 *  recieves events
 */
export default abstract class GameObject {
  Remove(state: LevelState) {
    state.ClearEventGroups(this);
  }
  PostConstruct(state: LevelState) {
    state.SetupEventGroups(this);
  }

  HasTag(_state: LevelState, _tag: ObjectTag) {
    return false;
  }
  OnInit(_state: LevelState) {}
  OnRemove(_state: LevelState) {}
  OnBeginStep(_state: LevelState, _trigger: boolean) {}
  OnBeginStepTrigger(_state: LevelState) {}
  OnEndStep(_state: LevelState, _trigger: boolean) {}
  OnEndStepTrigger(_state: LevelState) {}
  OnUpdate(_state: LevelState, _delta: number) {}
}

import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';

/**
 * GameObject:
 *  recieves events
 */
export default abstract class GameObject {
  private static _idCounter: number = 0;
  public _id: number = GameObject._idCounter++;

  Remove(state: LevelState) {
    this.OnRemove(state);
  }
  PostConstruct(state: LevelState) {
    state.SetupEventGroups(this);
    this.OnInit(state);
  }
  Exists(_state: LevelState) {
    return true;
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

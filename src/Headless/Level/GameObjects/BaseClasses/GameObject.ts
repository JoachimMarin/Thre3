import ObjectTag from 'Headless/Level/GameObjects/ObjectTag';
import DynamicState from 'Headless/Level/GameState/DynamicState';

/**
 * GameObject:
 *  recieves events
 */
export default abstract class GameObject {
  private static _idCounter: number = 0;
  public _id: number = GameObject._idCounter++;

  /**
   * Removes the object completely, ignoring the all states.
   * This is called when the user leaves the level.
   */
  Unload(virtual: boolean) {
    this.OnUnload(virtual);
  }

  /**
   * Removes the object from the state.
   * This is called during gameplay.
   * @param state
   */
  Remove(state: DynamicState) {
    state.ClearEventGroups(this);
    this.OnRemove(state);
  }

  /**
   * Must be called in the constructor of all child classes.
   * Finalizes object initialization.
   * @param state
   */
  PostConstruct(state: DynamicState) {
    state.SetupEventGroups(this);
    this.OnInit(state);
  }

  /**
   * Returns if the object exists in the given game state.
   * @param _state
   * @returns
   */
  Exists(_state: DynamicState) {
    return true;
  }

  /**
   * Returns if the object has the given tag in the given game state.
   * @param _state
   * @param _tag
   * @returns
   */
  HasTag(_state: DynamicState, _tag: ObjectTag) {
    return false;
  }

  // Events:
  OnUnload(_virtual: boolean) {}
  OnInit(_state: DynamicState) {}
  OnRemove(_state: DynamicState) {}
  OnBeginStep(_state: DynamicState, _trigger: boolean) {}
  OnBeginStepTrigger(_state: DynamicState) {}
  OnEndStep(_state: DynamicState, _trigger: boolean) {}
  OnEndStepTrigger(_state: DynamicState) {}
  OnUpdate(_state: DynamicState, _delta: number) {}

  toString() {
    return (this as unknown).constructor.name;
  }
}

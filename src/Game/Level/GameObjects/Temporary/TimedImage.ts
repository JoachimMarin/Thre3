import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2 } from 'Utils/Math/GridPoint';
import GameObjectImage from 'Game/Level/GameObjects/BaseClasses/GameObjectImage';

export default class TimedImage extends GameObjectImage {
  private duration: number;

  private constructor(
    state: DynamicState,
    aPoint: IVec2,
    imageKey: string,
    duration: number,
    displayWidth: number,
    displayHeight: number
  ) {
    super(state, aPoint, imageKey, displayWidth, displayHeight);
    this.duration = duration * 1000;
    this.PostConstruct(state);
  }

  public static Create(
    state: DynamicState,
    aPoint: IVec2,
    imageKey: string,
    duration: number = 1,
    displayWidth: number = 1,
    displayHeight: number = 1
  ) {
    if (state.virtual) {
      return null;
    } else {
      return new TimedImage(
        state,
        aPoint,
        imageKey,
        duration,
        displayWidth,
        displayHeight
      );
    }
  }

  override OnUpdate(state: DynamicState, delta: number): void {
    this.duration -= delta;
    if (this.duration <= 0) {
      this.Remove(state);
    }
  }
}

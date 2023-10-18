import Constants from 'Game/Constants';
import GameObjectImage from 'Game/Level/GameObjects/BaseClasses/GameObjectImage';
import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2 } from 'Utils/Math/GridPoint';


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
    if (Constants.INCLUDE_GRAPHICS) {
      return new TimedImage(
        state,
        aPoint,
        imageKey,
        duration,
        displayWidth,
        displayHeight
      );
    } else {
      return undefined;
    }
  }

  override OnUpdate(state: DynamicState, delta: number): void {
    this.duration -= delta;
    if (this.duration <= 0) {
      this.Remove(state);
    }
  }
}

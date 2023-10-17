import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2 } from 'Utils/Math/GridPoint';
import GameObjectImage from 'Game/Level/GameObjects/BaseClasses/GameObjectImage';

export default class PopUp extends GameObjectImage {
  private rotationAngle: number = 0;
  private readonly rotationSpeed: number;
  private readonly rotationAngleMax: number;

  private constructor(
    state: DynamicState,
    aPoint: IVec2,
    imageKey: string,
    rotationSpeed: number,
    numRotations: number,
    displayWidth: number,
    displayHeight: number
  ) {
    super(state, aPoint, imageKey, displayWidth, displayHeight);
    this.rotationSpeed = rotationSpeed;
    this.rotationAngleMax = numRotations * 360;
    this.PostConstruct(state);
  }

  public static Create(
    state: DynamicState,
    aPoint: IVec2,
    imageKey: string,
    rotationSpeed: number = 1,
    numRotations: number = 1,
    displayWidth: number = 1,
    displayHeight: number = 1
  ) {
    if (state.virtual) {
      return null;
    } else {
      return new PopUp(
        state,
        aPoint,
        imageKey,
        rotationSpeed,
        numRotations,
        displayWidth,
        displayHeight
      );
    }
  }

  private Rotate(state: DynamicState, angle: number) {
    this.rotationAngle += angle;
    if (this.rotationAngle >= this.rotationAngleMax) {
      this.Remove(state);
    } else {
      const displayAngleRad = ((this.rotationAngle % 360) / 180) * Math.PI;
      const xScale = Math.cos(displayAngleRad);

      this.image.flipX = xScale < 0;
      this.image.setDisplaySize(Math.abs(xScale), 1);
    }
  }

  override OnUpdate(state: DynamicState, delta: number): void {
    this.Rotate(state, delta * this.rotationSpeed);
  }
}

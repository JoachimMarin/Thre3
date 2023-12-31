import Constants from 'Game/Constants';
import GameObjectImage from 'Game/Level/GameObjects/BaseClasses/GameObjectImage';
import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2 } from 'Utils/Math/GridPoint';

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
    if (Constants.INCLUDE_GRAPHICS) {
      return new PopUp(
        state,
        aPoint,
        imageKey,
        rotationSpeed,
        numRotations,
        displayWidth,
        displayHeight
      );
    } else {
      return undefined;
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

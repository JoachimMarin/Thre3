import LevelState from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GameObject from './BaseClasses/GameObject';

export default class PopUp extends GameObject {
  private image: Phaser.GameObjects.Image;
  private rotationAngle: number = 0;
  private readonly rotationSpeed: number;
  private readonly rotationAngleMax: number;

  constructor(
    aPoint: IVec2,
    state: LevelState,
    imageKey: string,
    rotationSpeed: number = 1,
    numRotations: number = 1
  ) {
    super();
    this.rotationSpeed = rotationSpeed;
    this.rotationAngleMax = numRotations * 360;
    if (state.virtual) {
      this.Remove(state);
    } else {
      const point = Vec2.AsVec2(aPoint);
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        imageKey
      );
      this.image.setDisplaySize(1, 1);
    }
  }

  Rotate(state: LevelState, angle: number) {
    this.rotationAngle += angle;
    if (this.rotationAngle >= this.rotationAngleMax) {
      this.Remove(state);
    }
    const displayAngleRad = ((this.rotationAngle % 360) / 180) * Math.PI;
    const xScale = Math.cos(displayAngleRad);

    this.image.flipX = xScale < 0;
    this.image.setDisplaySize(Math.abs(xScale), 1);
  }

  OnUpdate(state: LevelState, delta: number): void {
    this.Rotate(state, delta * this.rotationSpeed);
  }
}

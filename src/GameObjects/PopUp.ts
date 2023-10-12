import LevelState from 'LevelScene/LevelState';
import GameObjectImage from './BaseClasses/GameObjectImage';
import { IVec2 } from 'Math/GridPoint';

export default class PopUp extends GameObjectImage {
  private rotationAngle: number = 0;
  private readonly rotationSpeed: number;
  private readonly rotationAngleMax: number;

  constructor(
    point: IVec2,
    grid: LevelState,
    imageKey: string,
    rotationSpeed: number = 1,
    numRotations: number = 1
  ) {
    super(point, grid, imageKey);
    this.rotationSpeed = rotationSpeed;
    this.rotationAngleMax = numRotations * 360;
    this.PostConstruct();
    if (this.grid.virtual) {
      this.Remove();
    }
  }

  Rotate(angle: number) {
    this.rotationAngle += angle;
    if (this.rotationAngle >= this.rotationAngleMax) {
      this.Remove();
    }
    const displayAngleRad = ((this.rotationAngle % 360) / 180) * Math.PI;
    const xScale = Math.cos(displayAngleRad);

    this.image.flipX = xScale < 0;
    this.image.setDisplaySize(Math.abs(xScale), 1);
  }

  OnUpdate(delta: number): void {
    this.Rotate(delta * this.rotationSpeed);
  }
}

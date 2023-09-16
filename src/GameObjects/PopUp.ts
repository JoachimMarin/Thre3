import LevelGrid from 'LevelGrid';
import GameObjectImage from './BaseClasses/GameObjectImage';
import { IGridPoint } from 'Math/GridPoint';

export default class PopUp extends GameObjectImage {
  private rotationAngle: number = 0;
  private readonly rotationSpeed: number;
  private readonly rotationAngleMax: number;

  constructor(
    point: IGridPoint,
    grid: LevelGrid,
    imageKey: string,
    rotationSpeed: number = 1,
    numRotations: number = 1
  ) {
    super(point, grid, imageKey);
    this.rotationSpeed = rotationSpeed;
    this.rotationAngleMax = numRotations * 360;
  }

  Rotate(angle: number) {
    this.rotationAngle += angle;
    if (this.rotationAngle >= this.rotationAngleMax) {
      this.Remove();
    }
    const displayAngleRad = ((this.rotationAngle % 360) / 180) * Math.PI;
    const xScale = Math.cos(displayAngleRad);

    this.image.flipX = xScale < 0;
    this.image.setDisplaySize(128 * Math.abs(xScale), 128);
  }

  OnUpdate(delta: number): void {
    this.Rotate(delta * this.rotationSpeed);
  }
}

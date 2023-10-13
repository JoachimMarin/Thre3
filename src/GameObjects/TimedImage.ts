import LevelState from 'LevelScene/LevelState';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GameObject from './BaseClasses/GameObject';

export default class TimedImage extends GameObject {
  private image: Phaser.GameObjects.Image;
  private duration: number;

  constructor(
    aPoint: IVec2,
    state: LevelState,
    imageKey: string,
    duration: number = 1,
    sizeX: number = 1,
    sizeY: number = 1
  ) {
    super();
    this.duration = duration * 1000;
    if (state.virtual) {
      this.Remove(state);
    } else {
      const point = Vec2.AsVec2(aPoint);
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        imageKey
      );
      this.image.setDisplaySize(sizeX, sizeY);
    }
  }

  OnUpdate(state: LevelState, delta: number): void {
    this.duration -= delta;
    if (this.duration <= 0) {
      this.Remove(state);
    }
  }
}

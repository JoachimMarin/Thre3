import LevelState from 'LevelScene/LevelState';
import GameObjectImage from 'GameObjects/BaseClasses/GameObjectImage';
import { IVec2 } from 'Math/GridPoint';

export default class TimedImage extends GameObjectImage {
  private duration: number;

  constructor(
    point: IVec2,
    grid: LevelState,
    imageKey: string,
    duration: number = 1,
    sizeX: number = 1,
    sizeY: number = 1
  ) {
    super(point, grid, imageKey, sizeX, sizeY);
    this.duration = duration * 1000;
    this.PostConstruct();
    if (this.grid.virtual) {
      this.Remove();
    }
  }

  OnUpdate(delta: number): void {
    this.duration -= delta;
    if (this.duration <= 0) {
      this.Remove();
    }
  }
}

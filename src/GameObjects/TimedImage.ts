import LevelGrid from 'LevelGrid';
import GameObjectImage from 'GameObjects/BaseClasses/GameObjectImage';

export default class TimedImage extends GameObjectImage {
  private duration: number;

  constructor(
    x: integer,
    y: integer,
    grid: LevelGrid,
    imageKey: string,
    duration: number = 1,
    sizeX: number = 128,
    sizeY: number = 128
  ) {
    super(x, y, grid, imageKey, sizeX, sizeY);
    this.duration = duration * 1000;
  }

  OnUpdate(delta: number): void {
    this.duration -= delta;
    if (this.duration <= 0) {
      this.Remove();
    }
  }
}

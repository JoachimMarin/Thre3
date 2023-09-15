import LevelGrid from 'LevelGrid';
import GridObjectStatic from 'GridObjects/GridObjectStatic';

export default class TimedImage extends GridObjectStatic {
  private duration: number;

  constructor(
    x: integer,
    y: integer,
    grid: LevelGrid,
    imageKey: string,
    duration: number = 1,
    size: number = 128
  ) {
    super(x, y, grid, imageKey);
    this.duration = duration * 1000;
    this.image.setSize(size, size);
  }

  OnUpdate(delta: number): void {
    this.duration -= delta;
    if (this.duration <= 0) {
      this.Remove();
    }
  }
}

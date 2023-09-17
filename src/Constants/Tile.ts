import GridObject from 'GameObjects/BaseClasses/GridObject';
import LevelGrid from 'LevelScene/LevelGrid';
import ImageKey from 'Constants/ImageKey';
import { IVec2 } from 'Math/GridPoint';

export default class Tile extends ImageKey {
  public readonly fun: (point: IVec2, grid: LevelGrid) => GridObject;

  constructor(
    imageKey: string,
    fun: (point: IVec2, grid: LevelGrid) => GridObject
  ) {
    super(imageKey);
    this.fun = fun;
    Tile.ALL.add(this);
  }
  static readonly ALL = new Set<Tile>();
}

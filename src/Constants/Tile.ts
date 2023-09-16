import GridObject from 'GameObjects/BaseClasses/GridObject';
import LevelGrid from 'LevelGrid';
import ImageKey from 'Constants/ImageKey';
import { IGridPoint } from 'Math/GridPoint';

export default class Tile extends ImageKey {
  public readonly fun: (point: IGridPoint, grid: LevelGrid) => GridObject;

  constructor(
    imageKey: string,
    fun: (point: IGridPoint, grid: LevelGrid) => GridObject
  ) {
    super(imageKey);
    this.fun = fun;
    Tile.ALL.add(this);
  }
  static readonly ALL = new Set<Tile>();
}

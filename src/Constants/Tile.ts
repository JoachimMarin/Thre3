import GridObject from 'GridObjects/GridObject';
import LevelGrid from 'LevelGrid';
import ImageKey from 'Constants/ImageKey';

export default class Tile extends ImageKey {
  public readonly fun: (x: integer, y: integer, grid: LevelGrid) => GridObject;

  constructor(
    imageKey: string,
    fun: (x: integer, y: integer, grid: LevelGrid) => GridObject
  ) {
    super(imageKey);
    this.fun = fun;
    Tile.ALL.add(this);
  }
  static readonly ALL = new Set<Tile>();
}

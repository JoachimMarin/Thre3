import ImageKey from 'Constants/ImageKey';
import { IVec2 } from 'Math/GridPoint';
import LevelState from 'Level/LevelState';

export default class Tile extends ImageKey {
  public readonly fun: (state: LevelState, point: IVec2) => void;

  constructor(
    imageKey: string,
    fun: (state: LevelState, point: IVec2) => void
  ) {
    super(imageKey);
    this.fun = fun;
    Tile.ALL.add(this);
  }
  static readonly ALL = new Set<Tile>();
}

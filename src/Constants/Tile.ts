import LevelState from 'LevelScene/LevelState';
import ImageKey from 'Constants/ImageKey';
import { IVec2 } from 'Math/GridPoint';

export default class Tile extends ImageKey {
  public readonly fun: (point: IVec2, grid: LevelState) => void;

  constructor(imageKey: string, fun: (point: IVec2, grid: LevelState) => void) {
    super(imageKey);
    this.fun = fun;
    Tile.ALL.add(this);
  }
  static readonly ALL = new Set<Tile>();
}

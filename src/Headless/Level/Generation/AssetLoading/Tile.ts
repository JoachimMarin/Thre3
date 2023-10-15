import LevelState from 'Headless/Level/GameState/LevelState';
import ImageKey from 'Headless/Level/Generation/AssetLoading/ImageKey';
import { IVec2 } from 'Headless/Utils/Math/GridPoint';

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

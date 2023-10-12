import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import LevelState from 'LevelScene/LevelState';
import { IVec2 } from 'Math/GridPoint';

export default class BlueWall extends GridObjectImage {
  static imageKey = 'blue_wall';

  constructor(point: IVec2, grid: LevelState) {
    super(point, grid);
    this.AddTag(ObjectTag.WALL);
    this.PostConstruct();
  }

  override DeepCopy(state: LevelState) {
    return new BlueWall(this.position, state);
  }
}

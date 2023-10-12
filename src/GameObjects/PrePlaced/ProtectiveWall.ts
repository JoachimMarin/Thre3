import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import LevelState from 'LevelScene/LevelState';
import { IVec2 } from 'Math/GridPoint';

export default class ProtectiveWall extends GridObjectImage {
  static imageKey = 'protective_wall';

  constructor(point: IVec2, grid: LevelState) {
    super(point, grid);
    this.AddTag(ObjectTag.WALL);
    this.AddTag(ObjectTag.DESTROY_BULLETS);
    this.PostConstruct();
  }

  override DeepCopy(state: LevelState) {
    return new ProtectiveWall(this.position, state);
  }
}

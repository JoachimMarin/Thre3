import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import LevelState from 'LevelScene/LevelState';
import { IVec2 } from 'Math/GridPoint';

export default class Goal extends GridObjectImage {
  static imageKey = 'goal';

  constructor(point: IVec2, grid: LevelState) {
    super(point, grid);
    this.AddTag(ObjectTag.GOAL);
    this.PostConstruct();
  }

  override DeepCopy(state: LevelState) {
    return new Goal(this.position, state);
  }
}

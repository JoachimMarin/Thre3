import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';

export default class BlueWall extends GridObjectImage {
  static imageKey = 'blue_wall';

  OnInit() {
    this.AddTag(ObjectTag.WALL);
  }
}

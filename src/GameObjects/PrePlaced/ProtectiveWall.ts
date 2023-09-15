import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';

export default class ProtectiveWall extends GridObjectImage {
  static imageKey = 'protective_wall';

  OnInit() {
    this.AddTag(ObjectTag.WALL);
    this.AddTag(ObjectTag.DESTROY_BULLETS);
  }
}

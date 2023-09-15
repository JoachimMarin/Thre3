import GridObjectStatic from 'GridObjects/GridObjectStatic';
import { GridTags } from 'Constants/GridTags';

export default class BlueWall extends GridObjectStatic {
  static imageKey = 'blue_wall';

  OnInit() {
    this.AddGridTag(GridTags.WALL);
  }
}

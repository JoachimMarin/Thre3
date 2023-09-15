import GridObjectStatic from 'GridObjects/GridObjectStatic';
import { GridTags } from 'Constants/GridTags';

export default class ProtectiveWall extends GridObjectStatic {
  static imageKey = 'protective_wall';

  OnInit() {
    this.AddGridTag(GridTags.WALL);
    this.AddGridTag(GridTags.DESTROY_BULLETS);
  }
}

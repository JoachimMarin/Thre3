import GridObjectStatic from './GridObjectStatic';
import { GridTags } from '../Constants/GridTags';

export default class ProtectiveWall extends GridObjectStatic {
  GetImageKey() {
    return 'protective_wall';
  }

  OnInit() {
    this.AddGridTag(GridTags.WALL);
    this.AddGridTag(GridTags.DESTROY_BULLETS);
  }
}

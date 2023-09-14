import GridObjectStatic from './GridObjectStatic';
import { GridTags } from '../Constants/GridTags';

export default class BlueWall extends GridObjectStatic {
  GetImageKey() {
    return 'blue_wall';
  }

  OnInit() {
    this.AddGridTag(GridTags.WALL);
  }
}

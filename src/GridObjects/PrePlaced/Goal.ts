import { GridTags } from 'Constants/GridTags';
import GridObjectStatic from 'GridObjects/GridObjectStatic';

export default class Goal extends GridObjectStatic {
  static imageKey = 'goal';

  OnInit() {
    this.AddGridTag(GridTags.DESTROY_BULLETS);
  }

  Remove() {
    this.image.destroy();
    super.Remove();
  }
}

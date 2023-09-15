import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';

export default class Goal extends GridObjectImage {
  static imageKey = 'goal';

  OnInit() {
    this.AddTag(ObjectTag.DESTROY_BULLETS);
  }
}

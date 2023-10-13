import { Vec2 } from 'Math/GridPoint';

export default class GridObjectChanges {
  public position: Vec2 | null = null;
  public disabled: boolean = false;

  DeepCopy() {
    const copy = new GridObjectChanges();
    copy.position = this.position;
    copy.disabled = this.disabled;
    return copy;
  }
}

export default class GridObjectChanges {
  public disabled: boolean = false;

  DeepCopy() {
    const copy = new GridObjectChanges();
    copy.disabled = this.disabled;
    return copy;
  }

  GetKeyString() {
    return this.disabled ? '1' : '0';
  }
}

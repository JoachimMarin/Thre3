export default class GridObjectChanges {
  public disabled: boolean = false;

  DeepCopy() {
    const copy = new GridObjectChanges();
    copy.disabled = this.disabled;
    return copy;
  }

  static GetByteArraySize() {
    return 1;
  }

  WriteByteArray(byteArray: Buffer, index: integer) {
    byteArray[index] = this.disabled ? 1 : 0;
  }
}

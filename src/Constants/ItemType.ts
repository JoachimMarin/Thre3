export default class ItemType {
  public readonly imageKey: string;

  constructor(imageKey: string) {
    this.imageKey = imageKey;
  }

  static MIRROR = new ItemType('mirror');
}

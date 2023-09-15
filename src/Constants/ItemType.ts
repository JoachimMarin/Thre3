import ImageKey from 'Constants/ImageKey';

export default class ItemType extends ImageKey {
  public readonly imageKey: string;

  constructor(imageKey: string) {
    super(imageKey);
    ItemType.ALL.add(this);
  }
  static readonly ALL = new Set<ItemType>();
}

export default class ItemType {
  public readonly imageKey: string;

  constructor(imageKey: string) {
    this.imageKey = imageKey;
    ItemType.ITEM_TYPES.add(this);
  }
  static readonly ITEM_TYPES = new Set<ItemType>();

  static readonly MIRROR = new ItemType('mirror');
  static readonly SHIELD = new ItemType('shield');
  static readonly SHOVEL = new ItemType('shovel');
}

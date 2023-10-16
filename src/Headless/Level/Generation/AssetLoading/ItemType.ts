import ImageKey from 'Headless/Level/Generation/AssetLoading/ImageKey';

export default class ItemType extends ImageKey {
  private static itemIdCounter: integer = 0;
  public readonly itemId: integer = ItemType.itemIdCounter++;
  public readonly imageKey: string;

  constructor(imageKey: string) {
    super(imageKey);
    ItemType.ALL.add(this);
  }
  static readonly ALL = new Set<ItemType>();
}

import ItemType from 'Headless/Level/Generation/AssetLoading/ItemType';

export default class Inventory {
  private itemCountMap: Map<integer, integer> = new Map<integer, integer>();

  DeepVirtualCopy() {
    const copy = new Inventory();
    for (const [k, v] of this.itemCountMap) {
      copy.itemCountMap.set(k, v);
    }
    return copy;
  }

  GetKey() {
    const buffer = Buffer.alloc(2 * this.itemCountMap.size);
    const keys = [];
    for (const key of this.itemCountMap.keys()) {
      keys.push(key);
    }
    keys.sort();
    for (let i = 0; i < keys.length; i++) {
      const count = this.itemCountMap.get(keys[i]);
      buffer[i * 2] = keys[i];
      buffer[i * 2 + 1] = count;
    }
    return buffer;
  }

  /**
   * Adds items to the inventory.
   * @param itemType The item type to be added.
   * @param count The number of items to be added.
   */
  AddItem(itemType: ItemType, count: integer = 1) {
    const itemKey = itemType.itemId;

    if (!this.itemCountMap.has(itemKey)) {
      this.itemCountMap.set(itemKey, count);
    } else {
      this.itemCountMap.set(itemKey, this.itemCountMap.get(itemKey) + count);
    }
  }

  /**
   * Removes items to the inventory.
   * @param itemType The item type to be removed.
   * @param count The number of items to be removed.
   */
  RemoveItem(itemType: ItemType, count: integer = 1) {
    const itemKey = itemType.itemId;
    const remaining = this.GetCount(itemType) - count;

    if (remaining > 0) {
      this.itemCountMap.set(itemKey, remaining);
    } else if (remaining == 0) {
      this.itemCountMap.delete(itemKey);
    } else {
      console.error('Not enough items');
    }
  }

  /**
   * Returns the number of items of the specified itemType contained in the inventory.
   * @param itemType
   * @returns
   */
  GetCount(itemType: ItemType) {
    const itemKey = itemType.itemId;
    if (this.itemCountMap.has(itemKey)) {
      return this.itemCountMap.get(itemKey);
    } else {
      return 0;
    }
  }

  /**
   * Returns true, if the inventory contains at least one item of the specified itemType.
   * @param itemType
   * @returns
   */
  HasItem(itemType: ItemType) {
    return this.GetCount(itemType) > 0;
  }

  /**
   * Removes all items from the inventory.
   */
  Clear() {
    this.itemCountMap.clear();
  }

  /**
   * Runs on scene update.
   */
  Update() {}
}

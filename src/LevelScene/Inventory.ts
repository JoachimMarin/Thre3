import ItemType from 'Constants/ItemType';
import SideUserInterfaceScene from './SideUserInterfaceScene';
import * as UI from 'UserInterface';

class InventoryEntry {
  public imageL: Phaser.GameObjects.Image;
  public textL: UI.Text;
  public itemType: ItemType;
  public count: integer;
  public index: integer;

  /**
   * Creates a new InventoryEntry.
   * @param itemType The item type of this InventoryEntry.
   * @param count The number of items for this item type.
   * @param index The UI slot index. This affects the display position of the icon and text.
   */
  constructor(itemType: ItemType, count: integer, index: integer) {
    this.itemType = itemType;
    this.count = count;
    this.index = index;
    this.imageL = SideUserInterfaceScene.SCENE.add
      .image(0, 0, itemType.imageKey)
      .setDisplaySize(6, 6)
      .setOrigin(0, 0);

    this.textL = new UI.Text(SideUserInterfaceScene.SCENE);
    this.textL.SetSize(3);
    this.textL.GetTextObject().setOrigin(0, 0.5);
    this.OnInventoryChange();
  }

  /**
   * Updates inventory slot index and item count in the UI.
   */
  OnInventoryChange() {
    const indexX = this.index % 2;
    const indexY = Math.floor(this.index / 2);
    const x = SideUserInterfaceScene.SCENE.landscapeX(2.5 + indexX * 13);
    const y = SideUserInterfaceScene.SCENE.landscapeY(8 + indexY * 7.5);
    const textX = SideUserInterfaceScene.SCENE.landscapeX(8.75 + indexX * 13);
    const textY = SideUserInterfaceScene.SCENE.landscapeY(11 + indexY * 7.5);

    this.imageL.setPosition(x, y);
    const text = this.textL.GetTextObject();
    text.setPosition(textX, textY);
    text.setText('x' + this.count);
  }

  /**
   * Runs on scene update.
   */
  Update() {
    this.textL.Update();
  }

  /**
   * Remove this InventoryEntry.
   */
  Remove() {
    this.imageL.destroy();
    this.textL.Remove();
  }
}

export default class Inventory {
  private itemCountMap: Map<string, integer> = new Map<string, integer>();
  private itemEntryList: InventoryEntry[] = [];
  private itemEntryMap: Map<string, integer> = null;

  public readonly virtual: boolean;

  constructor(virtual: boolean) {
    this.virtual = virtual;
    if (!virtual) {
      this.itemEntryMap = new Map<string, integer>();
    }
  }

  DeepVirtualCopy() {
    const copy = new Inventory(true);
    for (const [k, v] of this.itemCountMap) {
      copy.itemCountMap.set(k, v);
    }
    return copy;
  }

  GetKey() {
    let inventoryKey = '';
    const keys = [];
    for (const key of this.itemCountMap.keys()) {
      keys.push(key);
    }
    keys.sort();
    for (const key of keys) {
      inventoryKey += key + '=' + this.itemCountMap.get(key) + '|';
    }
    return inventoryKey;
  }

  /**
   * Adds items to the inventory.
   * @param itemType The item type to be added.
   * @param count The number of items to be added.
   */
  AddItem(itemType: ItemType, count: integer = 1) {
    const itemKey = itemType.imageKey;

    if (!this.itemCountMap.has(itemKey)) {
      this.itemCountMap.set(itemKey, count);
    } else {
      this.itemCountMap.set(itemKey, this.itemCountMap.get(itemKey) + count);
    }

    if (!this.virtual) {
      if (!this.itemEntryMap.has(itemKey)) {
        const index = this.itemEntryList.length;
        const entry = new InventoryEntry(itemType, count, index);
        this.itemEntryList.push(entry);
        this.itemEntryMap.set(itemKey, index);
        entry.OnInventoryChange();
      } else {
        const entry = this.itemEntryList[this.itemEntryMap.get(itemKey)];
        entry.count += count;
        entry.OnInventoryChange();
      }
    }
  }

  /**
   * Removes items to the inventory.
   * @param itemType The item type to be removed.
   * @param count The number of items to be removed.
   */
  RemoveItem(itemType: ItemType, count: integer = 1) {
    const itemKey = itemType.imageKey;
    const remaining = this.GetCount(itemType) - count;

    if (this.virtual) {
      if (remaining > 0) {
        this.itemCountMap.set(itemKey, remaining);
      } else if (remaining == 0) {
        this.itemCountMap.delete(itemKey);
      } else {
        console.error('Not enough items');
      }
    } else {
      if (remaining > 0) {
        const entry = this.itemEntryList[this.itemEntryMap.get(itemKey)];
        entry.count = remaining;
        entry.OnInventoryChange();
      } else if (remaining == 0) {
        const listIndex = this.itemEntryMap.get(itemKey);
        this.itemEntryList[listIndex].Remove();
        this.itemEntryList.splice(listIndex, 1);
        for (let i = listIndex; i < this.itemEntryList.length; i++) {
          const entry = this.itemEntryList[i];
          entry.index = i;
          entry.OnInventoryChange();
          this.itemEntryMap.set(entry.itemType.imageKey, i);
        }
        this.itemEntryMap.delete(itemKey);
      }
    }
  }

  /**
   * Returns the number of items of the specified itemType contained in the inventory.
   * @param itemType
   * @returns
   */
  GetCount(itemType: ItemType) {
    const itemKey = itemType.imageKey;
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
    if (!this.virtual) {
      for (const inventoryEntry of this.itemEntryList) {
        inventoryEntry.Remove();
      }
      this.itemEntryList = [];
      this.itemEntryMap.clear();
    }
  }

  /**
   * Runs on scene update.
   */
  Update() {
    for (const inventoryEntry of this.itemEntryList) {
      inventoryEntry.Update();
    }
  }
}

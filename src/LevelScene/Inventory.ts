import ItemType from 'Constants/ItemType';
import SideUserInterfaceScene from './SideUserInterfaceScene';
import * as UI from 'UserInterface';

let sideUI: SideUserInterfaceScene;

class VirtualInventoryEntry {
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
  }

  OnInventoryChange() {}
  Update() {}
  Remove() {}
}

class InventoryEntry extends VirtualInventoryEntry {
  public imageL: Phaser.GameObjects.Image;
  public textL: UI.Text;

  /**
   * Creates a new InventoryEntry.
   * @param itemType The item type of this InventoryEntry.
   * @param count The number of items for this item type.
   * @param index The UI slot index. This affects the display position of the icon and text.
   */
  constructor(itemType: ItemType, count: integer, index: integer) {
    super(itemType, count, index);
    this.imageL = sideUI.add
      .image(0, 0, itemType.imageKey)
      .setDisplaySize(6, 6)
      .setOrigin(0, 0);

    this.textL = new UI.Text(sideUI);
    this.textL.SetSize(3);
    this.textL.GetTextObject().setOrigin(0, 0.5);
    this.OnInventoryChange();
  }

  /**
   * Updates inventory slot index and item count in the UI.
   */
  override OnInventoryChange() {
    const indexX = this.index % 2;
    const indexY = Math.floor(this.index / 2);
    const x = sideUI.landscapeX(2.5 + indexX * 13);
    const y = sideUI.landscapeY(8 + indexY * 7.5);
    const textX = sideUI.landscapeX(8.75 + indexX * 13);
    const textY = sideUI.landscapeY(11 + indexY * 7.5);

    this.imageL.setPosition(x, y);
    const text = this.textL.GetTextObject();
    text.setPosition(textX, textY);
    text.setText('x' + this.count);
  }

  /**
   * Runs on scene update.
   */
  override Update() {
    this.textL.Update();
  }

  /**
   * Remove this InventoryEntry.
   */
  override Remove() {
    this.imageL.destroy();
    this.textL.Remove();
  }
}

export default class Inventory {
  private itemList: VirtualInventoryEntry[] = [];
  private itemMap: Map<string, integer> = new Map<string, integer>();
  public readonly virtual: boolean;

  constructor(virtual: boolean) {
    this.virtual = virtual;
    sideUI = SideUserInterfaceScene.SCENE;
  }

  DeepVirtualCopy() {
    const copy = new Inventory(true);
    for (const inventoryEntry of this.itemList) {
      copy.itemList.push(
        new VirtualInventoryEntry(
          inventoryEntry.itemType,
          inventoryEntry.count,
          inventoryEntry.count
        )
      );
    }
    for (const [key, value] of this.itemMap) {
      copy.itemMap.set(key, value);
    }
    return copy;
  }

  GetKey() {
    let inventoryKey = '';
    const keys = [];
    for (const key of this.itemMap.keys()) {
      keys.push(key);
    }
    keys.sort();
    for (const key of keys) {
      inventoryKey +=
        key + '=' + this.itemList[this.itemMap.get(key)].count + '|';
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
    console.log(itemKey);
    if (!this.itemMap.has(itemKey)) {
      const index = this.itemList.length;
      const entry = this.virtual
        ? new VirtualInventoryEntry(itemType, count, index)
        : new InventoryEntry(itemType, count, index);
      this.itemList.push(entry);
      this.itemMap.set(itemKey, index);
      entry.OnInventoryChange();
    } else {
      const entry = this.itemList[this.itemMap.get(itemKey)];
      entry.count += count;
      entry.OnInventoryChange();
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
    if (remaining > 0) {
      const entry = this.itemList[this.itemMap.get(itemKey)];
      entry.count = remaining;
      entry.OnInventoryChange();
    } else if (remaining == 0) {
      const listIndex = this.itemMap.get(itemKey);
      this.itemList[listIndex].Remove();
      this.itemList.splice(listIndex, 1);
      for (let i = listIndex; i < this.itemList.length; i++) {
        const entry = this.itemList[i];
        entry.index = i;
        entry.OnInventoryChange();
        this.itemMap.set(entry.itemType.imageKey, i);
      }
      this.itemMap.delete(itemKey);
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
    const itemKey = itemType.imageKey;
    if (this.itemMap.has(itemKey)) {
      const listIndex = this.itemMap.get(itemKey);
      if (this.itemList.length > listIndex) {
        return this.itemList[listIndex].count;
      }
      console.error('error GetCount ' + itemKey);
      console.log('list index = ' + listIndex);
      console.log('list length = ' + this.itemList.length);
      return 0;
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
    for (const inventoryEntry of this.itemList) {
      inventoryEntry.Remove();
    }
    this.itemList = [];
    this.itemMap.clear();
  }

  /**
   * Runs on scene update.
   */
  Update() {
    for (const inventoryEntry of this.itemList) {
      inventoryEntry.Update();
    }
  }
}

import ItemType from 'Constants/ItemType';
import SideUserInterfaceScene from './SideUserInterfaceScene';
import * as UI from 'UserInterface';

let sideUI: SideUserInterfaceScene;

class InventoryEntry {
  public itemType: ItemType;
  public count: integer;
  public index: integer;
  public imageL: Phaser.GameObjects.Image;
  public textL: UI.Text;

  constructor(itemType: ItemType, count: integer, index: integer) {
    this.itemType = itemType;
    this.count = count;
    this.index = index;
    this.imageL = sideUI.add
      .image(0, 0, itemType.imageKey)
      .setDisplaySize(6, 6)
      .setOrigin(0, 0);

    this.textL = new UI.Text(sideUI);
    this.textL.SetSize(3);
    this.textL.GetTextObject().setOrigin(0, 0.5);
    this.OnInventoryChange();
  }

  OnInventoryChange() {
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

  Update() {
    this.textL.Update();
  }

  Remove() {
    this.imageL.destroy();
    this.textL.Remove();
  }
}

export default class Inventory {
  private itemList: InventoryEntry[] = [];
  private itemMap: Map<string, integer> = new Map<string, integer>();

  constructor() {
    sideUI = SideUserInterfaceScene.SCENE;
  }

  AddItem(item: ItemType, count: integer = 1) {
    const itemKey = item.imageKey;
    console.log(itemKey);
    if (!this.itemMap.has(itemKey)) {
      const index = this.itemList.length;
      const entry = new InventoryEntry(item, count, index);
      this.itemList.push(entry);
      this.itemMap.set(itemKey, index);
      entry.OnInventoryChange();
    } else {
      const entry = this.itemList[this.itemMap.get(itemKey)];
      entry.count += count;
      entry.OnInventoryChange();
    }
  }

  RemoveItem(item: ItemType, count: integer = 1) {
    const itemKey = item.imageKey;
    const remaining = this.GetCount(item) - count;
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

  GetCount(item: ItemType) {
    const itemKey = item.imageKey;
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

  HasItem(item: ItemType) {
    return this.GetCount(item) > 0;
  }

  Clear() {
    for (const inventoryEntry of this.itemList) {
      inventoryEntry.Remove();
    }
    this.itemList = [];
    this.itemMap.clear();
  }

  Update() {
    for (const inventoryEntry of this.itemList) {
      inventoryEntry.Update();
    }
  }
}

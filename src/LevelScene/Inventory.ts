import ItemType from 'Constants/ItemType';
import SideUserInterfaceScene from './SideUserInterfaceScene';
import Constants from 'Constants/Constants';

let sideUI: SideUserInterfaceScene;

class InventoryEntry {
  public itemType: ItemType;
  public count: integer;
  public index: integer;
  public imageL: Phaser.GameObjects.Image;
  public textL: Phaser.GameObjects.Text;

  constructor(itemType: ItemType, count: integer, index: integer) {
    this.itemType = itemType;
    this.count = count;
    this.index = index;
    this.imageL = sideUI.add
      .image(0, 0, itemType.imageKey)
      .setDisplaySize(6, 6)
      .setOrigin(0, 0);

    this.textL = sideUI.add
      .text(0, 0, '')
      .setFontSize(Constants.fontSize)
      .setScale(3 / Constants.fontSize)
      .setOrigin(0, 0.5);
    sideUI.setTextStyle(this.textL);
    this.Update();
  }

  Update() {
    const indexX = this.index % 2;
    const indexY = Math.floor(this.index / 2);
    const x = sideUI.landscapeX(2.5 + indexX * 13);
    const y = sideUI.landscapeY(8 + indexY * 7.5);
    const textX = sideUI.landscapeX(8.75 + indexX * 13);
    const textY = sideUI.landscapeY(11 + indexY * 7.5);

    this.imageL.setPosition(x, y);
    this.textL.setPosition(textX, textY);
    this.textL.setText('x' + this.count);
  }

  Remove() {
    this.imageL.destroy();
    this.textL.destroy();
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
      entry.Update();
    } else {
      const entry = this.itemList[this.itemMap.get(itemKey)];
      entry.count += count;
      entry.Update();
    }
  }

  RemoveItem(item: ItemType, count: integer = 1) {
    const itemKey = item.imageKey;
    const remaining = this.GetCount(item) - count;
    if (remaining > 0) {
      const entry = this.itemList[this.itemMap.get(itemKey)];
      entry.count = remaining;
      entry.Update();
    } else if (remaining == 0) {
      const index = this.itemMap.get(itemKey);
      this.itemList[index].Remove();
      this.itemList.splice(index, 1);
      for (let i = index; i < this.itemList.length; i++) {
        const entry = this.itemList[i];
        entry.index = i;
        entry.Update();
      }
      this.itemMap.delete(itemKey);
    } else {
      console.error('Not enough items');
    }
  }

  GetCount(item: ItemType) {
    const itemKey = item.imageKey;
    console.log(itemKey);
    if (this.itemMap.has(itemKey)) {
      return this.itemList[this.itemMap.get(itemKey)].count;
    } else {
      return 0;
    }
  }

  HasItem(item: ItemType) {
    return this.GetCount(item) > 0;
  }
}

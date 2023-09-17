import ItemType from 'Constants/ItemType';
import LevelScene from 'LevelScene/LevelScene';
import { Vec2 } from 'Math/GridPoint';

class InventoryEntry {
  public itemType: ItemType;
  public count: integer;
  public index: integer;
  private levelScene: LevelScene;
  public image: Phaser.GameObjects.Image;
  public text: Phaser.GameObjects.Text;

  constructor(
    itemType: ItemType,
    count: integer,
    index: integer,
    levelScene: LevelScene
  ) {
    this.itemType = itemType;
    this.count = count;
    this.index = index;
    this.levelScene = levelScene;
    const position = Vec2.AsVec2([21, 1 + this.index]);
    this.image = levelScene.add.image(
      position.realX(),
      position.realY(),
      itemType.imageKey
    );
    this.image.setDisplaySize(128, 128);

    this.text = this.levelScene.add
      .text(position.realX() + 128, position.realY(), ' x ' + this.count)
      .setFont('Verdana')
      .setFontSize(160)
      .setColor('black')
      .setOrigin(0, 0.5);
  }

  Update() {
    const position = Vec2.AsVec2([21, 1 + this.index]);
    this.image.setPosition(position.realX(), position.realY());
    this.text.setPosition(position.realX() + 128, position.realY());
    this.text.setText(' x ' + this.count);
  }

  Remove() {
    this.image.destroy();
    this.text.destroy();
  }
}

export default class Inventory {
  private itemList: InventoryEntry[] = [];
  private itemMap: Map<string, integer> = new Map<string, integer>();
  private levelScene: LevelScene;

  constructor(levelScene: LevelScene) {
    this.levelScene = levelScene;
  }

  AddItem(item: ItemType, count: integer = 1) {
    const itemKey = item.imageKey;
    console.log(itemKey);
    if (!this.itemMap.has(itemKey)) {
      const index = this.itemList.length;
      const entry = new InventoryEntry(item, count, index, this.levelScene);
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

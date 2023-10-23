import Inventory from 'Game/Level/GameState/Inventory';
import ItemType from 'Game/Level/Generation/AssetLoading/ItemType';
import SideUserInterfaceScene from 'Phaser/UI/SideUserInterfaceScene';
import * as UI from 'Phaser/UI/UserInterface';

class InventoryEntry {
  public imageL: Phaser.GameObjects.Image;
  public textL: UI.Text;
  public imageP: Phaser.GameObjects.Image;
  public textP: UI.Text;
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
    this.imageP = SideUserInterfaceScene.SCENE.add
      .image(0, 0, itemType.imageKey)
      .setDisplaySize(6, 6)
      .setOrigin(0, 0);

    this.textL = new UI.Text(SideUserInterfaceScene.SCENE);
    this.textL.SetSize(3);
    this.textL.GetTextObject().setOrigin(0, 0.5);

    this.textP = new UI.Text(SideUserInterfaceScene.SCENE);
    this.textP.SetSize(3);
    this.textP.GetTextObject().setOrigin(0, 0.5);
    this.OnInventoryChange();
  }

  /**
   * Updates inventory slot index and item count in the UI.
   */
  OnInventoryChange() {
    const indexXL = this.index % 2;
    const indexYL = Math.floor(this.index / 2);

    const xL = SideUserInterfaceScene.SCENE.landscapeX(2.5 + indexXL * 13);
    const yL = SideUserInterfaceScene.SCENE.landscapeY(32.5 + indexYL * 7.5);
    const textXL = SideUserInterfaceScene.SCENE.landscapeX(8.75 + indexXL * 13);
    const textYL = SideUserInterfaceScene.SCENE.landscapeY(
      35.5 + indexYL * 7.5
    );

    this.imageL.setPosition(xL, yL);
    const textObjectL = this.textL.GetTextObject();
    textObjectL.setPosition(textXL, textYL);
    textObjectL.setText('x' + this.count);

    const indexXP = Math.floor(this.index / 3);
    const indexYP = this.index % 3;

    const xP = SideUserInterfaceScene.SCENE.portraitX(32.5 + indexXP * 11);
    const yP = SideUserInterfaceScene.SCENE.portraitY(2.5 + indexYP * 9.5);
    const textXP = SideUserInterfaceScene.SCENE.portraitX(38.75 + indexXP * 11);
    const textYP = SideUserInterfaceScene.SCENE.portraitY(5.5 + indexYP * 9.5);

    this.imageP.setPosition(xP, yP);
    const textObjectP = this.textP.GetTextObject();
    textObjectP.setPosition(textXP, textYP);
    textObjectP.setText('x' + this.count);
  }

  /**
   * Runs on scene update.
   */
  Update() {
    this.textL.Update();
    this.textP.Update();
  }

  /**
   * Remove this InventoryEntry.
   */
  Remove() {
    this.imageL.destroy();
    this.textL.Remove();
    this.imageP.destroy();
    this.textP.Remove();
  }
}

export default class InventoryUI extends Inventory {
  private itemEntryList: InventoryEntry[] = [];
  private itemEntryMap: Map<string, integer> = new Map<string, integer>();

  constructor() {
    super();
  }

  override AddItem(itemType: ItemType, count: integer = 1) {
    super.AddItem(itemType, count);
    const itemKey = itemType.imageKey;

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

  override RemoveItem(itemType: ItemType, count: integer = 1) {
    super.RemoveItem(itemType, count);
    const itemKey = itemType.imageKey;
    const remaining = this.GetCount(itemType);

    if (remaining > 0) {
      const entry = this.itemEntryList[this.itemEntryMap.get(itemKey)];
      entry.count = remaining;
      entry.OnInventoryChange();
    } else if (remaining === 0) {
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

  override Clear() {
    super.Clear();

    for (const inventoryEntry of this.itemEntryList) {
      inventoryEntry.Remove();
    }
    this.itemEntryList = [];
    this.itemEntryMap.clear();
  }

  override Update() {
    for (const inventoryEntry of this.itemEntryList) {
      inventoryEntry.Update();
    }
  }
}

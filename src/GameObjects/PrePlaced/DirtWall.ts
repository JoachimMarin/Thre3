import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';

export default class DirtWall extends GridObjectImage {
  static imageKey = 'dirt_wall';

  OnInit() {
    this.AddTag(ObjectTag.CONDITIONAL_WALL);
    this.AddTag(ObjectTag.DESTROY_BULLETS);
  }

  override IsWall(): boolean {
    return !this.grid.inventory.HasItem(ItemDefinitions.SHOVEL);
  }

  override OnBeginStep(_trigger: boolean): void {
    if (this.grid.player.destination.Equals(this.position)) {
      this.grid.inventory.RemoveItem(ItemDefinitions.SHOVEL);
      this.Remove();
    }
  }
}

import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import ObjectTag from 'Constants/ObjectTag';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import LevelState from 'LevelScene/LevelState';
import { IVec2 } from 'Math/GridPoint';

export default class DirtWall extends GridObjectImage {
  static tags = new Set<ObjectTag>([
    ObjectTag.CONDITIONAL_WALL,
    ObjectTag.DESTROY_BULLETS
  ]);
  static imageKey = 'dirt_wall';

  constructor(point: IVec2, grid: LevelState) {
    super(point, grid);
    this.PostConstruct();
  }

  override GetStaticTags(): Set<ObjectTag> {
    return DirtWall.tags;
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
  override DeepCopy(state: LevelState) {
    return new DirtWall(this.position, state);
  }
}

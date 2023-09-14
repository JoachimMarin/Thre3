import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import { Direction } from '../Constants/Direction';
import { getAllEnumValues } from 'enum-for';
import LaserProjectile from './LaserProjectile';
import LaserColor from '../Constants/LaserColor';
import GridObjectStatic from './GridObjectStatic';

export default class LaserGun extends GridObjectStatic {
  private color: LaserColor;

  constructor(x: integer, y: integer, grid: LevelGrid, color: LaserColor) {
    super(x, y, grid, color.name + '_gun');
    this.color = color;
  }

  OnInit() {
    this.AddGridTag(GridTags.WALL);
    this.AddGridTag(GridTags.DESTROY_BULLETS);
  }

  OnBeginStepTrigger(): void {
    for (const dir of getAllEnumValues(Direction)) {
      const nextPoint = this.position.Translate(dir);
      if (
        this.grid.IsInBounds(nextPoint) &&
        !this.grid.HasGridTag(nextPoint, GridTags.DESTROY_BULLETS)
      ) {
        new LaserProjectile(
          nextPoint.x,
          nextPoint.y,
          this.grid,
          dir,
          this.color.length,
          this.color,
          this
        );
      }
    }
  }
}

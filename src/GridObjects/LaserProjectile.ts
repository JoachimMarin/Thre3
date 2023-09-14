import * as Phaser from 'phaser';
import GridObject from './GridObject';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import { Direction } from '../Constants/Direction';
import GridPoint from '../Math/GridPoint';
import LaserColor from '../Constants/LaserColor';

export default class LaserProjectile extends GridObject {
  public image: Phaser.GameObjects.Image;
  public owner: GridObject;

  constructor(
    x: integer,
    y: integer,
    grid: LevelGrid,
    direction: Direction,
    length: integer,
    color: LaserColor,
    owner: GridObject
  ) {
    super(x, y, grid);
    this.owner = owner;
    this.owner.AddChild(this);
    let end = true;
    if (length > 1) {
      const nextPoint = this.position.Translate(direction);
      if (
        this.grid.IsInBounds(nextPoint) &&
        !this.grid.HasGridTag(nextPoint, GridTags.DESTROY_BULLETS)
      ) {
        end = false;
        new LaserProjectile(
          nextPoint.x,
          nextPoint.y,
          this.grid,
          direction,
          length - 1,
          color,
          owner
        );
      }
    }
    this.image = grid.levelScene.add.image(
      this.position.realX(),
      this.position.realY(),
      color.name + (end ? '_projectile_end' : '_projectile')
    );
    this.image.setDisplaySize(128, 128);
    this.image.setAngle(GridPoint.DirectionToAngle(direction));
    this.image.setVisible(false);
    setTimeout(() => {
      this.image.setVisible(true);
    }, 150);
  }
  OnInit() {
    this.AddGridTag(GridTags.DEADLY);
  }

  Remove() {
    this.image.destroy();
    super.Remove();
  }

  OnBeginStep(_trigger: boolean): void {
    this.Remove();
  }
}

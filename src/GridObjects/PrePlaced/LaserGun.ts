import { GridTags } from 'Constants/GridTags';
import LevelGrid from 'LevelGrid';
import { Direction } from 'Constants/Direction';
import { getAllEnumValues } from 'enum-for';
import GridObjectStatic from 'GridObjects/GridObjectStatic';
import GridObject from 'GridObjects/GridObject';
import GridPoint from 'Math/GridPoint';
import ImageKey from 'Constants/ImageKey';

export class LaserColor {
  public readonly name: string;
  public readonly length: integer;
  public readonly projectile: ImageKey;
  public readonly projectileEnd: ImageKey;
  public readonly gunImageKey: string;
  public static readonly ALL = new Set<LaserColor>();

  constructor(name: string, length: integer) {
    this.name = name;
    this.length = length;
    this.gunImageKey = name + '_gun';
    this.projectile = new ImageKey(name + '_projectile');
    this.projectileEnd = new ImageKey(name + '_projectile_end');
    LaserColor.ALL.add(this);
  }

  public static readonly GREEN = new LaserColor('green', 3);
  public static readonly YELLOW = new LaserColor('yellow', 4);
  public static readonly RED = new LaserColor('red', 5);
  public static readonly BLUE = new LaserColor('blue', 7);
  public static readonly PURPLE = new LaserColor('purple', 10);
}

export class LaserProjectile extends GridObject {
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
      end ? color.projectileEnd.imageKey : color.projectile.imageKey
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
    this.AddGridTag(GridTags.CAN_BE_REFLECTED);
  }

  Remove() {
    this.image.destroy();
    super.Remove();
  }

  OnBeginStep(_trigger: boolean): void {
    this.Remove();
  }
}

export default class LaserGun extends GridObjectStatic {
  private color: LaserColor;

  constructor(x: integer, y: integer, grid: LevelGrid, color: LaserColor) {
    super(x, y, grid, color.gunImageKey);
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

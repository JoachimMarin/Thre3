import ObjectTag from 'Constants/ObjectTag';
import LevelGrid from 'LevelGrid';
import Direction from 'Math/Direction';
import { getAllEnumValues } from 'enum-for';
import GridObject from 'GameObjects/BaseClasses/GridObject';
import { IGridPoint } from 'Math/GridPoint';
import ImageKey from 'Constants/ImageKey';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';

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
    point: IGridPoint,
    grid: LevelGrid,
    direction: Direction,
    length: integer,
    color: LaserColor,
    owner: GridObject
  ) {
    super(point, grid);
    this.owner = owner;
    this.owner.AddChild(this);
    let end = true;
    if (length > 1) {
      const nextPoint = this.position.Translate(direction);
      if (
        this.grid.IsInBounds(nextPoint) &&
        !this.grid.HasGridTag(nextPoint, ObjectTag.DESTROY_BULLETS)
      ) {
        end = false;
        new LaserProjectile(
          nextPoint,
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
    this.image.setAngle(direction.ToAngle());
    this.image.setVisible(false);
    setTimeout(() => {
      this.image.setVisible(true);
    }, 150);
  }
  OnInit() {
    this.AddTag(ObjectTag.DEADLY);
    this.AddTag(ObjectTag.CAN_BE_REFLECTED);
  }

  Remove() {
    this.image.destroy();
    super.Remove();
  }

  OnBeginStep(_trigger: boolean): void {
    this.Remove();
  }
}

export default class LaserGun extends GridObjectImage {
  private color: LaserColor;

  constructor(point: IGridPoint, grid: LevelGrid, color: LaserColor) {
    super(point, grid, color.gunImageKey);
    this.color = color;
  }

  OnInit() {
    this.AddTag(ObjectTag.WALL);
    this.AddTag(ObjectTag.DESTROY_BULLETS);
  }

  OnBeginStepTrigger(): void {
    for (const dir of getAllEnumValues(Direction)) {
      const nextPoint = this.position.Translate(dir);
      if (
        this.grid.IsInBounds(nextPoint) &&
        !this.grid.HasGridTag(nextPoint, ObjectTag.DESTROY_BULLETS)
      ) {
        new LaserProjectile(
          nextPoint,
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

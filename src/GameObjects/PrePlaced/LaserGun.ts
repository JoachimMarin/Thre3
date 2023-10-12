import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';
import Direction from 'Math/Direction';
import { getAllEnumValues } from 'enum-for';
import GridObject from 'GameObjects/BaseClasses/GridObject';
import { IVec2 } from 'Math/GridPoint';
import ImageKey from 'Constants/ImageKey';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import GameObjectPosition from 'GameObjects/BaseClasses/GameObjectPosition';

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

export class LaserProjectile extends GameObjectPosition {
  static tags = new Set<ObjectTag>([
    ObjectTag.DEADLY,
    ObjectTag.CAN_BE_REFLECTED
  ]);

  public image: Phaser.GameObjects.Image;
  public owner: GridObject;

  constructor(
    point: IVec2,
    grid: LevelState,
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
    if (this.position.Equals(this.grid.player.destination)) {
      this.grid.player.objectsToProcess.push(this);
    }
    if (!this.grid.virtual) {
      this.image = grid.levelScene.add.image(
        this.position.realX(),
        this.position.realY(),
        end ? color.projectileEnd.imageKey : color.projectile.imageKey
      );
      this.image.setDisplaySize(1, 1);
      this.image.setAngle(direction.ToAngle());
      this.image.setVisible(false);
      setTimeout(() => {
        this.image.setVisible(true);
      }, 150);
    }
    this.PostConstruct();
  }

  override GetStaticTags(): Set<ObjectTag> {
    return LaserProjectile.tags;
  }

  Remove() {
    if (!this.grid.virtual) {
      this.image.destroy();
    }
    super.Remove();
  }

  OnBeginStep(_trigger: boolean): void {
    this.Remove();
  }
}

export default class LaserGun extends GridObjectImage {
  static tags = new Set<ObjectTag>([ObjectTag.WALL, ObjectTag.DESTROY_BULLETS]);

  private color: LaserColor;

  constructor(point: IVec2, grid: LevelState, color: LaserColor) {
    super(point, grid, color.gunImageKey);
    this.color = color;
    this.PostConstruct();
  }

  override GetStaticTags(): Set<ObjectTag> {
    return LaserGun.tags;
  }

  override DeepCopy(state: LevelState) {
    return new LaserGun(this.position, state, this.color);
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

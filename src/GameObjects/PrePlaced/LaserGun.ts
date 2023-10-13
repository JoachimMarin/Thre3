import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';
import Direction from 'Math/Direction';
import { getAllEnumValues } from 'enum-for';
import { IVec2, Vec2 } from 'Math/GridPoint';
import ImageKey from 'Constants/ImageKey';
import GameObject from 'GameObjects/BaseClasses/GameObject';
import GridObjectStatic from 'GameObjects/BaseClasses/GridObjectStatic';

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

export class LaserProjectile extends GameObject {
  static tags = new Set<ObjectTag>([
    ObjectTag.DEADLY,
    ObjectTag.CAN_BE_REFLECTED
  ]);

  public image: Phaser.GameObjects.Image;
  public owner: LaserGun;
  public state: LevelState;

  constructor(
    aPoint: IVec2,
    state: LevelState,
    direction: Direction,
    length: integer,
    color: LaserColor,
    owner: LaserGun
  ) {
    super();
    this.owner = owner;
    this.owner.projectiles.push(this);
    this.state = state;
    const point = Vec2.AsVec2(aPoint);
    //this.owner.AddChild(this);
    let end = true;
    if (length > 1) {
      const nextPoint = point.Translate(direction);
      if (
        state.IsInBounds(nextPoint) &&
        !state.HasGridTag(nextPoint, ObjectTag.DESTROY_BULLETS)
      ) {
        end = false;
        new LaserProjectile(
          nextPoint,
          state,
          direction,
          length - 1,
          color,
          owner
        );
      }
    }
    if (point.Equals(state.player.destination)) {
      state.player.objectsToProcess.push(this);
    }
    this.PostConstruct(state);
    if (!state.virtual) {
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        end ? color.projectileEnd.imageKey : color.projectile.imageKey
      );
      this.image.setDisplaySize(1, 1);
      this.image.setAngle(direction.ToAngle());
      this.image.setVisible(false);
      setTimeout(() => {
        this.image.setVisible(true);
      }, 150);
    }
  }

  override HasTag(_state: LevelState, tag: ObjectTag) {
    return LaserProjectile.tags.has(tag);
  }

  override OnRemove(_state: LevelState) {
    if (!this.state.virtual) {
      this.image.destroy();
    }
  }

  override OnBeginStep(state: LevelState, _trigger: boolean): void {
    this.Remove(state);
  }
}

export default class LaserGun extends GridObjectStatic {
  public image: Phaser.GameObjects.Image;

  static tags = new Set<ObjectTag>([ObjectTag.WALL, ObjectTag.DESTROY_BULLETS]);

  private color: LaserColor;
  public projectiles: LaserProjectile[] = [];

  constructor(state: LevelState, aPoint: IVec2, color: LaserColor) {
    super(state, aPoint);
    this.color = color;

    if (!state.virtual) {
      const point = Vec2.AsVec2(aPoint);
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        color.gunImageKey
      );
      this.image.setDisplaySize(1, 1);
    }

    this.PostConstructStatic(state);
  }

  override HasTag(_state: LevelState, tag: ObjectTag) {
    return LaserGun.tags.has(tag);
  }

  override OnRemove(state: LevelState) {
    for (const projectile of this.projectiles) {
      projectile.Remove(state);
    }
    if (!state.virtual) {
      this.image.destroy();
    }
  }

  override OnBeginStepTrigger(state: LevelState): void {
    this.projectiles = [];
    for (const dir of getAllEnumValues(Direction)) {
      const nextPoint = this.position.Translate(dir);
      if (
        state.IsInBounds(nextPoint) &&
        !state.HasGridTag(nextPoint, ObjectTag.DESTROY_BULLETS)
      ) {
        new LaserProjectile(
          nextPoint,
          state,
          dir,
          this.color.length,
          this.color,
          this
        );
      }
    }
  }
}

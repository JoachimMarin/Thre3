import ObjectTag from 'Constants/ObjectTag';
import LevelState, { StaticState } from 'LevelScene/LevelState';
import Direction from 'Math/Direction';
import { getAllEnumValues } from 'enum-for';
import GridObject from 'GameObjects/BaseClasses/GridObject';
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
  public owner: GridObject;
  public state: LevelState;

  constructor(
    aPoint: IVec2,
    state: LevelState,
    direction: Direction,
    length: integer,
    color: LaserColor,
    owner: GridObject
  ) {
    super();
    this.owner = owner;
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

  Remove() {
    if (!this.state.virtual) {
      this.image.destroy();
    }
    super.Remove(this.state);
  }

  OnBeginStep(_state: LevelState, _trigger: boolean): void {
    this.Remove();
  }
}

export default class LaserGun extends GridObjectStatic {
  static tags = new Set<ObjectTag>([ObjectTag.WALL, ObjectTag.DESTROY_BULLETS]);

  private color: LaserColor;

  constructor(state: StaticState, point: IVec2, color: LaserColor) {
    super(state, point);
    this.color = color;
  }

  override HasTag(_state: LevelState, tag: ObjectTag) {
    return LaserGun.tags.has(tag);
  }

  override OnBeginStepTrigger(state: LevelState): void {
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

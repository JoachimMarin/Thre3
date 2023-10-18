import Constants from 'Game/Constants';
import GridObjectStaticImage from 'Game/Level/GameObjects/BaseClasses/GridObjectStaticImage';
import ObjectTag from 'Game/Level/GameObjects/ObjectTag';
import DynamicState from 'Game/Level/GameState/DynamicState';
import StaticState from 'Game/Level/GameState/StaticState';
import ImageKey from 'Game/Level/Generation/AssetLoading/ImageKey';
import Direction from 'Utils/Math/Direction';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';


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

export class LaserProjectile {
  public image: Phaser.GameObjects.Image;
  public owner: LaserGun;

  constructor(
    aPoint: IVec2,
    state: DynamicState,
    direction: Direction,
    length: integer,
    color: LaserColor,
    owner: LaserGun
  ) {
    this.owner = owner;
    this.owner.projectiles.push(this);
    const point = Vec2.AsVec2(aPoint);
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
    if (Constants.INCLUDE_GRAPHICS) {
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        end ? color.projectileEnd.imageKey : color.projectile.imageKey
      );
      this.image.setDisplaySize(1, 1);
      this.image.setAngle(direction.angle);
      this.image.setVisible(false);
      setTimeout(() => {
        this.image.setVisible(true);
      }, 150);
    }
  }
}

export default class LaserGun extends GridObjectStaticImage {
  public image: Phaser.GameObjects.Image;

  static tags = new Set<ObjectTag>([ObjectTag.WALL, ObjectTag.DESTROY_BULLETS]);

  private color: LaserColor;
  public projectiles: LaserProjectile[] = [];

  constructor(state: StaticState, aPoint: IVec2, color: LaserColor) {
    super(state, aPoint, color.gunImageKey);
    this.color = color;
    this.PostConstructStatic(state);
  }

  override HasTag(_state: DynamicState, tag: ObjectTag) {
    return LaserGun.tags.has(tag);
  }

  private RemoveProjectiles() {
    if (Constants.INCLUDE_GRAPHICS) {
      for (const projectile of this.projectiles) {
        projectile.image.destroy();
        projectile.image = undefined;
      }
    }
    this.projectiles = [];
  }

  override OnRemove(_state: DynamicState) {
    this.RemoveProjectiles();
  }

  override OnUnload(): void {
    this.RemoveProjectiles();
  }

  override OnBeginStep(_state: DynamicState, _trigger: boolean): void {
    this.RemoveProjectiles();
  }

  override OnBeginStepTrigger(state: DynamicState): void {
    if (
      !Constants.INCLUDE_GRAPHICS &&
      this.position.x != state.player.destination.x &&
      this.position.y != state.player.destination.y
    ) {
      // TODO: could cause problems once more complicated items are added
      return;
    }
    for (const dir of Direction.ALL) {
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

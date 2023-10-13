import * as Phaser from 'phaser';
import Direction from 'Math/Direction';
import ObjectTag from 'Constants/ObjectTag';
import { IVec2, Vec2 } from 'Math/GridPoint';
import Item from './Item';
import PopUp from 'GameObjects/PopUp';
import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import LevelState from 'LevelScene/LevelState';
import Solver from 'LevelScene/Solver';
import GameObject from 'GameObjects/BaseClasses/GameObject';
import GridObjectDynamic from 'GameObjects/BaseClasses/GridObjectDynamic';
import { LaserProjectile } from './LaserGun';
import TimedImage from 'GameObjects/TimedImage';
import ImageDefinitions from 'Constants/Definitions/ImageDefinitions';

export default class Player extends GridObjectDynamic {
  public image: Phaser.GameObjects.Image;
  static imageKey = 'player';

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private moving: boolean = false;
  private direction: Direction = Direction.DOWN;
  public destination: Vec2;
  private gameOver: boolean = false;
  public objectsToProcess: GameObject[] = [];
  private grid: LevelState;

  constructor(point: IVec2, grid: LevelState) {
    super(grid, point);
    this.grid = grid;
    this.grid.player = this;
    if (!this.grid.virtual) {
      this.cursors = grid.levelScene.cursors;
      this.image = grid.levelScene.add.image(
        this.position.realX(),
        this.position.realY(),
        Player.imageKey
      );
      this.image.setDisplaySize(1, 1);
    }
    this.PostConstruct(grid);
  }

  override DeepCopy(state: LevelState) {
    return new Player(this.position, state);
  }

  Defeat() {
    if (!this.gameOver) {
      this.gameOver = true;
      if (this.grid.virtual) {
        Solver.Defeat();
      } else {
        setTimeout(() => {
          this.grid.levelScene.restartLevel();
        }, 2000);
      }
    }
  }

  Victory() {
    if (this.grid.virtual) {
      Solver.Victory();
    } else {
      this.grid.levelScene.changeToNextLevel();
    }
  }

  EndPlayerStep() {
    this.grid.EndPlayerStep();

    const itemList = this.grid.GetByTag(this.position, ObjectTag.ITEM);
    for (const item of itemList) {
      if (item instanceof Item) {
        item.Remove(this.grid);
        this.grid.inventory.AddItem(item.itemType, 1);
      }
    }

    const deadlyList: GameObject[] = this.grid.GetByTag(
      this.position,
      ObjectTag.DEADLY
    );
    for (const obj of this.objectsToProcess) {
      if (obj.HasTag(this.grid, ObjectTag.DEADLY)) {
        deadlyList.push(obj);
      }
    }
    let useMirror = false;
    let useShield = false;
    for (const deadly of deadlyList) {
      let blocked = false;
      if (deadly.HasTag(this.grid, ObjectTag.CAN_BE_REFLECTED)) {
        if (!useMirror && this.grid.inventory.HasItem(ItemDefinitions.MIRROR)) {
          this.grid.inventory.RemoveItem(ItemDefinitions.MIRROR);
          useMirror = true;
          new PopUp(this.position, this.grid, ItemDefinitions.MIRROR.imageKey);
        }
        if (
          !useMirror &&
          !useShield &&
          this.grid.inventory.HasItem(ItemDefinitions.SHIELD)
        ) {
          this.grid.inventory.RemoveItem(ItemDefinitions.SHIELD);
          useShield = true;
          new PopUp(this.position, this.grid, ItemDefinitions.SHIELD.imageKey);
        }
        if (useMirror) {
          if (deadly instanceof LaserProjectile) {
            deadly.owner.Remove(this.grid);
            new TimedImage(
              deadly.owner.position,
              this.grid,
              ImageDefinitions.EXPLOSION.imageKey,
              0.3,
              1.25,
              1.25
            );
          }

          blocked = true;
        } else if (useShield) {
          blocked = true;
        }
      }
      if (!blocked) {
        this.Defeat();
      }
    }
    if (!this.gameOver && this.grid.HasGridTag(this.position, ObjectTag.GOAL)) {
      this.Victory();
    }
    this.objectsToProcess = [];
  }

  CanMoveTo(point: IVec2) {
    if (!this.grid.IsInBounds(point)) {
      return false;
    }
    if (this.grid.HasGridTag(point, ObjectTag.WALL)) {
      return false;
    }
    if (this.grid.HasGridTag(point, ObjectTag.CONDITIONAL_WALL)) {
      const conditionalWalls = this.grid.GetByTag(
        point,
        ObjectTag.CONDITIONAL_WALL
      );
      for (const wall of conditionalWalls) {
        if (wall.IsWall(this.grid)) {
          return false;
        }
      }
    }
    return true;
  }

  OnUpdate(_state: LevelState, delta: number): void {
    const speed = 0.004;
    if (this.moving) {
      const translationVector = Vec2.TranslationVector(this.direction);
      this.image.x += speed * delta * translationVector.x;
      this.image.y += speed * delta * translationVector.y;
      if (
        translationVector.x * this.image.x >=
          translationVector.x * this.destination.realX() &&
        translationVector.y * this.image.y >=
          translationVector.y * this.destination.realY()
      ) {
        this.moving = false;
        this.SetGridPosition(this.destination);
        this.EndPlayerStep();
      }
    }

    if (!this.moving && !this.gameOver) {
      if (this.cursors.left.isDown) {
        this.moving = true;
        this.direction = Direction.LEFT;
      } else if (this.cursors.right.isDown) {
        this.moving = true;
        this.direction = Direction.RIGHT;
      } else if (this.cursors.up.isDown) {
        this.moving = true;
        this.direction = Direction.UP;
      } else if (this.cursors.down.isDown) {
        this.moving = true;
        this.direction = Direction.DOWN;
      }
      if (this.moving) {
        this.destination = this.position.Translate(this.direction);
        if (!this.CanMoveTo(this.destination)) {
          this.moving = false;
        }
      }
      if (this.moving) {
        this.image.setAngle(this.direction.ToAngle());
        this.grid.BeginPlayerStep();
      }
    }
  }
}

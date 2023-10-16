import * as Phaser from 'phaser';
import Direction from 'Headless/Utils/Math/Direction';
import ObjectTag from 'Headless/Level/GameObjects/ObjectTag';
import { IVec2, Vec2 } from 'Headless/Utils/Math/GridPoint';
import Item from 'Headless/Level/GameObjects/PrePlaced/Item';
import PopUp from 'Headless/Level/GameObjects/Temporary/PopUp';
import DynamicState from 'Headless/Level/GameState/DynamicState';
import GridObject from 'Headless/Level/GameObjects/BaseClasses/GridObject';
import { LaserProjectile } from 'Headless/Level/GameObjects/PrePlaced/LaserGun';
import ImageDefinitions from 'Headless/Level/Generation/AssetDefinitions/ImageDefinitions';
import IImage from 'PhaserStubs/IImage';
import Solver from 'Headless/Level/GameState/Solver';
import ItemDefinitions from 'Headless/Level/Generation/AssetDefinitions/ItemDefinitions';
import TimedImage from 'Headless/Level/GameObjects/Temporary/TimedImage';

export default class Player extends GridObject {
  public image: IImage;
  static imageKey = 'player';

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private moving: boolean = false;
  private direction: Direction = Direction.DOWN;
  public destination: Vec2;
  private gameOver: boolean = false;
  public objectsToProcess: LaserProjectile[] = [];
  private grid: DynamicState;

  constructor(point: IVec2, grid: DynamicState) {
    super(point);
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

  override OnRemove(_state: DynamicState): void {
    if (!this.grid.virtual) {
      this.image.destroy();
      this.image = null;
    }
  }
  override OnUnload(virtual: boolean): void {
    if (!virtual) {
      this.image.destroy();
      this.image = null;
    }
  }

  override DeepCopy(state: DynamicState) {
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

    let useMirror = false;
    let useShield = false;
    for (const deadly of this.objectsToProcess) {
      let blocked = false;

      if (!useMirror && this.grid.inventory.HasItem(ItemDefinitions.MIRROR)) {
        this.grid.inventory.RemoveItem(ItemDefinitions.MIRROR);
        useMirror = true;
        PopUp.Create(this.grid, this.position, ItemDefinitions.MIRROR.imageKey);
      }
      if (
        !useMirror &&
        !useShield &&
        this.grid.inventory.HasItem(ItemDefinitions.SHIELD)
      ) {
        this.grid.inventory.RemoveItem(ItemDefinitions.SHIELD);
        useShield = true;
        PopUp.Create(this.grid, this.position, ItemDefinitions.SHIELD.imageKey);
      }
      if (useMirror) {
        deadly.owner.Remove(this.grid);
        TimedImage.Create(
          this.grid,
          deadly.owner.position,
          ImageDefinitions.EXPLOSION.imageKey,
          0.3,
          1.25,
          1.25
        );

        blocked = true;
      } else if (useShield) {
        blocked = true;
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

  SetGridPosition(position: Vec2) {
    this.position = position;
  }

  OnUpdate(_state: DynamicState, delta: number): void {
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
        this.image.setAngle(this.direction.angle);
        this.grid.BeginPlayerStep();
      }
    }
  }
}
import * as Phaser from 'phaser';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import Direction from 'Math/Direction';
import ObjectTag from 'Constants/ObjectTag';
import LevelGrid from 'LevelScene/LevelGrid';
import { IVec2, Vec2 } from 'Math/GridPoint';
import Item from './Item';
import PopUp from 'GameObjects/PopUp';
import TimedImage from 'GameObjects/TimedImage';
import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import ImageDefinitions from 'Constants/Definitions/ImageDefinitions';
import GameObjectPosition from 'GameObjects/BaseClasses/GameObjectPosition';

export default class Player extends GridObjectImage {
  static imageKey = 'player';

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private moving: boolean = false;
  private direction: Direction = Direction.DOWN;
  public destination: Vec2;
  private gameOver: boolean = false;

  constructor(point: IVec2, grid: LevelGrid) {
    super(point, grid, Player.imageKey);
    this.grid.player = this;
    this.cursors = grid.levelScene.cursors;
  }

  GameOver() {
    if (!this.gameOver) {
      this.gameOver = true;
      setTimeout(() => {
        this.grid.levelScene.restartLevel();
      }, 2000);
    }
  }

  EndPlayerStep() {
    this.grid.EndPlayerStep();

    const itemList = this.grid.GetByTag(this.position, ObjectTag.ITEM);
    for (const item of itemList) {
      if (item instanceof Item) {
        item.Remove();
        this.grid.inventory.AddItem(item.itemType, 1);
      }
    }

    const deadlyList = this.grid.GetByTag(this.position, ObjectTag.DEADLY);
    let useMirror = false;
    let useShield = false;
    for (const deadly of deadlyList) {
      let blocked = false;
      if (deadly.HasTag(ObjectTag.CAN_BE_REFLECTED)) {
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
          for (const parent of deadly.parents) {
            if (parent instanceof GameObjectPosition) {
              parent.Remove();
              new TimedImage(
                parent.position,
                this.grid,
                ImageDefinitions.EXPLOSION.imageKey,
                0.3,
                1.25,
                1.25
              );
            }
          }

          blocked = true;
        } else if (useShield) {
          blocked = true;
        }
      }
      if (!blocked) {
        this.GameOver();
      }
    }
    if (!this.gameOver && this.grid.HasGridTag(this.position, ObjectTag.GOAL)) {
      this.grid.levelScene.changeToNextLevel();
    }
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
        if (wall.IsWall()) {
          return false;
        }
      }
    }
    return true;
  }

  OnUpdate(delta: number): void {
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

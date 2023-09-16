import * as Phaser from 'phaser';
import GridObjectImage from 'GameObjects/BaseClasses/GridObjectImage';
import Direction from 'Math/Direction';
import ObjectTag from 'Constants/ObjectTag';
import LevelGrid from 'LevelGrid';
import { IGridPoint, GridPoint } from 'Math/GridPoint';
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
  private destination: GridPoint;
  private gameOver: boolean = false;

  constructor(point: IGridPoint, grid: LevelGrid) {
    super(point, grid, Player.imageKey);
    this.grid.player = this;
    this.cursors = grid.levelScene.cursors;
  }

  GameOver() {
    this.gameOver = true;
    setTimeout(() => {
      this.grid.levelScene.scene.restart();
    }, 2000);
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
                160
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
  }

  OnUpdate(delta: number): void {
    const speed = 0.6;
    if (this.moving) {
      const translationVector = GridPoint.TranslationVector(this.direction);
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
        if (
          !this.grid.IsInBounds(this.destination) ||
          this.grid.HasGridTag(this.destination, ObjectTag.WALL)
        ) {
          this.moving = false;
        }
      }
      if (this.moving) {
        this.image.setAngle(this.direction.ToAngle());
        this.grid.BeginPlayerStep();
      }
    }
  }

  LimitCamera() {
    const width = 128 * this.grid.width;
    const height = 128 * this.grid.height;

    let cameraSize = 2560 / this.grid.levelScene.camera.zoom;
    if (cameraSize > width && cameraSize > height) {
      this.grid.levelScene.camera.zoom = 2560 / Math.max(width, height);
      cameraSize = 2560 / this.grid.levelScene.camera.zoom;
    }

    let diff = width - cameraSize;
    let maxX = (1 / this.grid.levelScene.camera.zoom - 1) * 1920;
    let minX = maxX + diff;
    if (maxX < minX) {
      const tmp = minX;
      minX = maxX;
      maxX = tmp;
    }

    diff = height - cameraSize;
    let maxY = (1 / this.grid.levelScene.camera.zoom - 1) * 1280;
    let minY = maxY + diff;
    if (maxY < minY) {
      const tmp = minY;
      minY = maxY;
      maxY = tmp;
    }

    this.grid.levelScene.camera.scrollX = Math.min(
      maxX,
      Math.max(minX, this.grid.levelScene.camera.scrollX)
    );
    this.grid.levelScene.camera.scrollY = Math.min(
      maxY,
      Math.max(minY, this.grid.levelScene.camera.scrollY)
    );
  }

  OnInit(): void {
    this.grid.levelScene.camera.centerOn(this.image.x, this.image.y);
    this.grid.levelScene.input.on(
      'wheel',
      (_pointer, _gameObjects, _deltaX, deltaY, _deltaZ) => {
        if (deltaY > 0) {
          this.grid.levelScene.camera.zoom = Math.max(
            this.grid.levelScene.camera.zoom - 0.25,
            0.25
          );
        }

        if (deltaY < 0) {
          this.grid.levelScene.camera.zoom = Math.min(
            this.grid.levelScene.camera.zoom + 0.25,
            2
          );
        }
        this.LimitCamera();
      }
    );

    this.grid.levelScene.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;

      this.grid.levelScene.camera.scrollX -=
        ((pointer.x - pointer.prevPosition.x) * 4) /
        this.grid.levelScene.camera.zoom;
      this.grid.levelScene.camera.scrollY -=
        ((pointer.y - pointer.prevPosition.y) * 4) /
        this.grid.levelScene.camera.zoom;
      this.LimitCamera();
    });
    this.LimitCamera();
  }
}

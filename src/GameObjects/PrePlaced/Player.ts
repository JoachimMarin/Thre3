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
import UserInterfaceScene from 'UserInterfaceScene';

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
    this.LimitCamera();
  }

  LimitCamera() {
    console.log(
      this.grid.levelScene.sys.game.canvas.width,
      this.grid.levelScene.sys.game.canvas.height
    );

    let canvasWidth = this.grid.levelScene.sys.game.canvas.width;
    let canvasHeight = this.grid.levelScene.sys.game.canvas.height;

    const uiCam = UserInterfaceScene.SCENE.cameras.main;
    const gridCam = UserInterfaceScene.SCENE.gridCam;
    if (canvasWidth >= canvasHeight) {
      canvasWidth -= 0.67 * canvasHeight;

      uiCam.setViewport(canvasWidth, 0, 0.67 * canvasHeight, canvasHeight);
      uiCam.centerOn(10000, 0);
      uiCam.zoom = canvasHeight / 1500;

      gridCam.setZoom(canvasHeight / 1000);
    } else {
      canvasHeight -= 0.67 * canvasWidth;
      const uiCam = UserInterfaceScene.SCENE.cameras.main;
      uiCam.setViewport(0, canvasHeight, canvasWidth, 0.67 * canvasWidth);
      uiCam.centerOn(0, -10000);
      uiCam.zoom = canvasWidth / 1500;

      gridCam.setZoom(canvasWidth / 1000);
    }
    gridCam.setViewport(0, 0, canvasWidth, canvasHeight);
    gridCam.centerOn(0, 0);

    this.grid.levelScene.camera.setViewport(0, 0, canvasWidth, canvasHeight);

    const levelWidth = 128 * this.grid.width;
    const levelHeight = 128 * this.grid.height;

    let cameraWidth = canvasWidth / this.grid.levelScene.camera.zoom;
    let cameraHeight = canvasHeight / this.grid.levelScene.camera.zoom;

    if (cameraWidth > levelWidth && cameraHeight > levelHeight) {
      const zoomFactor = Math.min(
        cameraWidth / levelWidth,
        cameraHeight / levelHeight
      );
      this.grid.levelScene.camera.zoom *= zoomFactor;
      cameraWidth = canvasWidth / this.grid.levelScene.camera.zoom;
      cameraHeight = canvasHeight / this.grid.levelScene.camera.zoom;
    }

    let diff = levelWidth - cameraWidth;
    let maxX = ((1 / this.grid.levelScene.camera.zoom - 1) * canvasWidth) / 2;
    let minX = maxX + diff;
    if (maxX < minX) {
      const tmp = minX;
      minX = maxX;
      maxX = tmp;
    }

    diff = levelHeight - cameraHeight;
    let maxY = ((1 / this.grid.levelScene.camera.zoom - 1) * canvasHeight) / 2;
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

  ChangeZoom(factor: number) {
    this.grid.levelScene.camera.zoom *= factor;
  }

  OnInit(): void {
    this.grid.levelScene.camera.centerOn(this.image.x, this.image.y);
    this.grid.levelScene.input.on(
      'wheel',
      (_pointer, _gameObjects, _deltaX, deltaY, _deltaZ) => {
        if (deltaY > 0) {
          this.ChangeZoom(1.0 / 1.2);
        }

        if (deltaY < 0) {
          this.ChangeZoom(1.2);
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

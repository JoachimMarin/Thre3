import * as Phaser from 'phaser';

import GameObject from 'GameObjects/BaseClasses/GameObject';
import SideUserInterfaceScene from './SideUserInterfaceScene';
import GridUserInterfaceScene from './GridUserInterfaceScene';
import { Vec2 } from 'Math/GridPoint';
import LevelGrid from './LevelGrid';

const maxZoomInTiles = 4;

export default class CameraManager extends GameObject {
  private canvasSize: Vec2 = Vec2.AsVec2([0, 0]);
  private uiCanvasSize: Vec2 = Vec2.AsVec2([0, 0]);
  private mainCanvasSize: Vec2 = Vec2.AsVec2([0, 0]);

  private mainScene: Phaser.Scene;
  private mainCam: Phaser.Cameras.Scene2D.Camera;
  private sideUICam: Phaser.Cameras.Scene2D.Camera;
  private gridUICam: Phaser.Cameras.Scene2D.Camera;

  constructor(grid: LevelGrid) {
    super(grid);
    this.mainScene = grid.levelScene;
    this.mainCam = this.mainScene.cameras.main;
    this.sideUICam = SideUserInterfaceScene.SCENE.cameras.main;
    this.gridUICam = GridUserInterfaceScene.SCENE.cameras.main;
  }

  UpdateCanvas() {
    const newCanvasSize = Vec2.AsVec2([
      this.mainScene.sys.game.canvas.width,
      this.mainScene.sys.game.canvas.height
    ]);

    if (newCanvasSize.Subtract(this.canvasSize).Norm() <= 0) {
      return;
    }
    this.canvasSize = newCanvasSize;

    const sideUISizeFactor =
      SideUserInterfaceScene.SCENE.shortSide /
      SideUserInterfaceScene.SCENE.longSide;

    if (this.canvasSize.x >= this.canvasSize.y) {
      // landscape mode
      this.uiCanvasSize = Vec2.AsVec2([
        sideUISizeFactor * this.canvasSize.y,
        this.canvasSize.y
      ]);

      this.mainCanvasSize = Vec2.AsVec2([
        this.canvasSize.x - sideUISizeFactor * this.canvasSize.y,
        this.canvasSize.y
      ]);

      this.sideUICam.setViewport(
        this.mainCanvasSize.x,
        0,
        this.uiCanvasSize.x,
        this.uiCanvasSize.y
      );
      this.sideUICam.centerOn(10000, 0);
      this.sideUICam.zoom =
        this.uiCanvasSize.y / SideUserInterfaceScene.SCENE.longSide;
    } else {
      // portrait mode
      this.uiCanvasSize = Vec2.AsVec2([
        this.canvasSize.x,
        sideUISizeFactor * this.canvasSize.x
      ]);

      this.mainCanvasSize = Vec2.AsVec2([
        this.canvasSize.x,
        this.canvasSize.y - sideUISizeFactor * this.canvasSize.x
      ]);

      this.sideUICam.setViewport(
        0,
        this.mainCanvasSize.y,
        this.uiCanvasSize.x,
        this.uiCanvasSize.y
      );
      this.sideUICam.centerOn(0, -10000);
      this.sideUICam.zoom =
        this.uiCanvasSize.x / SideUserInterfaceScene.SCENE.longSide;
    }

    this.gridUICam.setZoom(
      Math.min(
        this.mainCanvasSize.x / GridUserInterfaceScene.SCENE.side,
        this.mainCanvasSize.y / GridUserInterfaceScene.SCENE.side
      )
    );
    this.gridUICam.setViewport(
      0,
      0,
      this.mainCanvasSize.x,
      this.mainCanvasSize.y
    );
    this.gridUICam.centerOn(0, 0);

    // this camera shows the grid view
    this.mainCam.setViewport(
      0,
      0,
      this.mainCanvasSize.x,
      this.mainCanvasSize.y
    );
  }

  LimitCamera() {
    const levelWidth = 128 * this.grid.width;
    const levelHeight = 128 * this.grid.height;

    let cameraWidth = this.mainCanvasSize.x / this.mainCam.zoom;
    let cameraHeight = this.mainCanvasSize.y / this.mainCam.zoom;

    // limit zoom out
    if (cameraWidth > levelWidth && cameraHeight > levelHeight) {
      const zoomFactor = Math.min(
        cameraWidth / levelWidth,
        cameraHeight / levelHeight
      );
      this.mainCam.zoom *= zoomFactor;
      cameraWidth = this.mainCanvasSize.x / this.mainCam.zoom;
      cameraHeight = this.mainCanvasSize.y / this.mainCam.zoom;
    }
    // limit zoom in
    if (
      cameraWidth < 128 * maxZoomInTiles ||
      cameraHeight < 128 * maxZoomInTiles
    ) {
      const zoomFactor = Math.min(
        cameraWidth / 128 / maxZoomInTiles,
        cameraHeight / 128 / maxZoomInTiles
      );
      this.mainCam.zoom *= zoomFactor;
      cameraWidth = this.mainCanvasSize.x / this.mainCam.zoom;
      cameraHeight = this.mainCanvasSize.y / this.mainCam.zoom;
    }

    let diff = levelWidth - cameraWidth;
    let maxX = ((1 / this.mainCam.zoom - 1) * this.mainCanvasSize.x) / 2;
    let minX = maxX + diff;
    if (maxX < minX) {
      const tmp = minX;
      minX = maxX;
      maxX = tmp;
    }

    diff = levelHeight - cameraHeight;
    let maxY = ((1 / this.mainCam.zoom - 1) * this.mainCanvasSize.y) / 2;
    let minY = maxY + diff;
    if (maxY < minY) {
      const tmp = minY;
      minY = maxY;
      maxY = tmp;
    }

    this.mainCam.scrollX = Math.min(maxX, Math.max(minX, this.mainCam.scrollX));
    this.mainCam.scrollY = Math.min(maxY, Math.max(minY, this.mainCam.scrollY));
  }

  ChangeZoom(factor: number) {
    this.mainCam.zoom *= factor;
  }

  OnInit(): void {
    this.UpdateCanvas();
    this.mainCam.setZoom(0.00001);
    this.mainCam.centerOn(
      (this.grid.width / 2) * 128,
      (this.grid.height / 2) * 128
    );
    this.LimitCamera();
    this.mainScene.input.on(
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

    this.mainScene.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;

      this.mainCam.scrollX -=
        ((pointer.x - pointer.prevPosition.x) * 4) / this.mainCam.zoom;
      this.mainCam.scrollY -=
        ((pointer.y - pointer.prevPosition.y) * 4) / this.mainCam.zoom;
      this.LimitCamera();
    });
  }

  OnUpdate(_delta: number): void {
    this.UpdateCanvas();
    this.LimitCamera();
  }
}

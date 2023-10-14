import * as Phaser from 'phaser';

import GameObject from 'GameObjects/BaseClasses/GameObject';
import SideUserInterfaceScene from './SideUserInterfaceScene';
import GridUserInterfaceScene from './GridUserInterfaceScene';
import { Vec2 } from 'Math/GridPoint';
import DynamicState from 'Level/DynamicState';

const maxZoomInTiles = 4;

export default class CameraManager extends GameObject {
  private state: DynamicState;
  private canvasSize: Vec2 = Vec2.AsVec2([0, 0]);
  private uiCanvasSize: Vec2 = Vec2.AsVec2([0, 0]);
  private mainCanvasSize: Vec2 = Vec2.AsVec2([0, 0]);

  private mainScene: Phaser.Scene;
  private mainCam: Phaser.Cameras.Scene2D.Camera;
  private sideUICam: Phaser.Cameras.Scene2D.Camera;
  private gridUICam: Phaser.Cameras.Scene2D.Camera;

  constructor(state: DynamicState) {
    super();
    this.state = state;
    this.mainScene = state.levelScene;
    this.mainCam = this.mainScene.cameras.main;
    this.sideUICam = SideUserInterfaceScene.SCENE.cameras.main;
    this.gridUICam = GridUserInterfaceScene.SCENE.cameras.main;
    this.PostConstruct(state);
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
    this.gridUICam.centerOn(-10000, 0);

    // this camera shows the grid view
    this.mainCam.setViewport(
      0,
      0,
      this.mainCanvasSize.x,
      this.mainCanvasSize.y
    );
  }

  LimitCamera() {
    const levelWidth = this.state.staticState.width;
    const levelHeight = this.state.staticState.height;

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
    if (cameraWidth < maxZoomInTiles || cameraHeight < maxZoomInTiles) {
      const zoomFactor = Math.min(
        cameraWidth / maxZoomInTiles,
        cameraHeight / maxZoomInTiles
      );
      this.mainCam.zoom *= zoomFactor;
      cameraWidth = this.mainCanvasSize.x / this.mainCam.zoom;
      cameraHeight = this.mainCanvasSize.y / this.mainCam.zoom;
    }

    let maxX: number;
    let minX: number;
    if (levelWidth > cameraWidth) {
      minX = ((1 / this.mainCam.zoom - 1) * this.mainCanvasSize.x) / 2;
      maxX = minX + levelWidth - cameraWidth;
    } else {
      minX =
        ((1 / this.mainCam.zoom - 1) * this.mainCanvasSize.x) / 2 +
        (levelWidth - cameraWidth) / 2;
      maxX = minX;
    }
    this.mainCam.scrollX = Math.min(maxX, Math.max(minX, this.mainCam.scrollX));

    let maxY: number;
    let minY: number;
    if (levelHeight > cameraHeight) {
      minY = ((1 / this.mainCam.zoom - 1) * this.mainCanvasSize.y) / 2;
      maxY = minY + levelHeight - cameraHeight;
    } else {
      minY =
        ((1 / this.mainCam.zoom - 1) * this.mainCanvasSize.y) / 2 +
        (levelHeight - cameraHeight) / 2;
      maxY = minY;
    }
    this.mainCam.scrollY = Math.min(maxY, Math.max(minY, this.mainCam.scrollY));
  }

  ChangeZoom(factor: number) {
    this.mainCam.zoom *= factor;
  }

  OnInit(): void {
    this.UpdateCanvas();
    this.mainCam.setZoom(0.00001);
    this.mainCam.centerOn(
      this.state.staticState.width / 2,
      this.state.staticState.height / 2
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

  OnUpdate(_state: DynamicState, _delta: number): void {
    this.UpdateCanvas();
    this.LimitCamera();
  }

  OnUnload(_virtual: boolean): void {
    this.mainScene.input.off('wheel');
    this.mainScene.input.off('pointermove');
  }
}

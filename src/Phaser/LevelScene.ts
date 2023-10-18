import * as Phaser from 'phaser';

import SideUserInterfaceScene from 'Phaser/UI/SideUserInterfaceScene';
import GridUserInterfaceScene from 'Phaser/UI/GridUserInterfaceScene';

import LevelParser from 'Game/Level/Generation/AssetLoading/LevelParser';
import SceneLevelParser from 'Phaser/SceneLevelParser';
import InventoryUI from 'Phaser/UI/InventoryUI';
import CameraManager from 'Phaser/CameraManager';
import GameManager from 'Game/GameManager';
import LevelState from 'Game/Level/GameState/LevelState';

export default class LevelScene extends Phaser.Scene {
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private levelParser: LevelParser;
  private ready: boolean = false;
  private additionalScenes: Phaser.Scene[];

  public static readonly SCENE = new LevelScene();
  private background: Phaser.GameObjects.Rectangle;
  public staticImages: Phaser.GameObjects.Image[] = [];

  private readonly gameManager: GameManager;
  private cameraManager: CameraManager;
  private levelIndex: integer;

  private constructor() {
    super('level');
    this.additionalScenes = [
      SideUserInterfaceScene.SCENE,
      GridUserInterfaceScene.SCENE
    ];
    this.levelParser = new SceneLevelParser(this, []);
    GameManager.Init(this.levelParser, this, () => new InventoryUI());
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.levelParser.Preload();
  }

  LoadLevel(state: LevelState) {
    this.cameraManager = new CameraManager(this, state);
    this.background = this.add
      .rectangle(
        0,
        0,
        state.staticState.width,
        state.staticState.height,
        0xaabbcc
      )
      .setOrigin(0, 0);
  }

  Unload() {
    for (const img of this.staticImages) {
      img.destroy();
    }
    this.staticImages = [];
    this.background.destroy();
    this.background = null;
    this.cameraManager.Unload();
    this.cameraManager = null;
  }

  ChangeSceneToLevel(current: Phaser.Scene, index: integer) {
    this.levelIndex = index;
    current.scene.start(this);
  }

  create() {
    this.ready = false;
    for (const scene of this.additionalScenes) {
      this.scene.launch(scene);
    }

    // wait until additional scenes have run "create"
    // this allows us to fully interact with them
    // for example accessing their cameras with CameraManager
    const waitForScenes = setInterval(() => {
      for (const scene of this.additionalScenes) {
        if (this.scene.getStatus(scene) != 5) {
          return;
        }
      }

      clearInterval(waitForScenes);
      this.createReady();
    }, 5);
  }

  createReady() {
    GameManager.LoadLevel(this.levelIndex);
    this.ready = true;
  }

  update(time: number, delta: number) {
    if (this.ready) {
      GameManager.Update(time, delta);
      this.cameraManager.Update();
    }
  }
}

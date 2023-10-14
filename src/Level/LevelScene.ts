import * as Phaser from 'phaser';

import SideUserInterfaceScene from '../LevelScene/SideUserInterfaceScene';
import GridUserInterfaceScene from '../LevelScene/GridUserInterfaceScene';
import LevelParser from 'Level/LevelParser';
import LevelList from 'Constants/Definitions/LevelList';
import LevelState from './LevelState';

export default class LevelScene extends Phaser.Scene {
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private levelParser: LevelParser;
  private ready: boolean = false;
  private additionalScenes: Phaser.Scene[];

  public index: integer = 0;

  public static readonly SCENE = new LevelScene();
  public staticImages: Phaser.GameObjects.Image[] = [];

  public levelState: LevelState = null;

  private constructor() {
    super('level');
    this.additionalScenes = [
      SideUserInterfaceScene.SCENE,
      GridUserInterfaceScene.SCENE
    ];
    this.levelParser = new LevelParser(this, []);
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.levelParser.Preload();
  }

  changeSceneToLevel(current: Phaser.Scene, index: integer) {
    this.index = index;
    current.scene.start(this);
  }

  restartLevel() {
    this.LoadLevel();
  }

  changeToNextLevel() {
    const next = this.index + 1;
    if (next < LevelList.length) {
      this.changeSceneToLevel(this, next);
    } else {
      console.log('you won all levels');
    }
  }

  Unload() {
    for (const img of this.staticImages) {
      img.destroy();
    }
    this.staticImages = [];
  }

  LoadLevel() {
    if (this.levelState != null) {
      this.levelState.UnloadLevel();
    }
    this.levelState = new LevelState(this);
    this.levelState.LoadLevel(this.index, this.levelParser);
  }

  OnFullyLoaded() {
    this.levelState = new LevelState(this);
    this.levelState.SolveLevel(this.index, this.levelParser);
  }

  createReady() {
    this.OnFullyLoaded();
    this.ready = true;
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

  update(_time: number, delta: number) {
    if (this.ready) {
      this.levelState.dynamicState.Update(delta);
    }
  }
}

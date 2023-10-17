//import ILevelScene from 'PhaserStubs/ILevelScene';
import DynamicState from 'Game/Level/GameState/DynamicState';
import StaticState from 'Game/Level/GameState/StaticState';
import Inventory from 'Game/Level/GameState/Inventory';
import LevelParser from 'Game/Level/Generation/AssetLoading/LevelParser';
import LevelScene from 'Phaser/LevelScene';

export default class LevelState {
  private _staticState: StaticState;
  private _dynamicState: DynamicState;
  private _levelScene: LevelScene;
  private loaded: boolean = false;

  constructor(levelScene: LevelScene) {
    this.levelScene = levelScene;
  }

  public get staticState(): StaticState {
    return this._staticState;
  }
  private set staticState(v: StaticState) {
    this._staticState = v;
  }
  get dynamicState(): DynamicState {
    return this._dynamicState;
  }
  private set dynamicState(v: DynamicState) {
    this._dynamicState = v;
  }
  get levelScene(): LevelScene {
    return this._levelScene;
  }
  private set levelScene(v: LevelScene) {
    this._levelScene = v;
  }

  /**
   * Removes all game objects.
   */
  public UnloadLevel() {
    if (this.loaded) {
      this.dynamicState.Unload();
      this.dynamicState = null;
      this.staticState.Unload();
      this.staticState = null;
      if (this.levelScene != null) {
        this.levelScene.Unload();
        this.levelScene = null;
      }
      this.loaded = false;
    }
  }

  /**
   * Prepares new static and dynamic states for the given level index.
   * @param index
   * @param levelParser
   * @param inv
   */
  public LoadLevel(index: integer, levelParser: LevelParser, inv: Inventory) {
    levelParser.LoadLevelInfo(index);

    this.staticState = new StaticState(
      levelParser.levelFile.width,
      levelParser.levelFile.height,
      this.levelScene
    );
    this.dynamicState = new DynamicState(
      this.staticState,
      inv,
      this.levelScene
    );

    levelParser.BuildLevel(this);
    this.loaded = true;
  }
}

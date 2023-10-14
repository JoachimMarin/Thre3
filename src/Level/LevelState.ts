import LevelScene from 'Level/LevelScene';
import DynamicState from './DynamicState';
import StaticState from './StaticState';
import Inventory from 'LevelScene/Inventory';
import LevelParser from './LevelParser';
import CameraManager from 'LevelScene/CameraManager';
import Solver from 'LevelScene/Solver';

export default class LevelState {
  private _staticState: StaticState;
  private _dynamicState: DynamicState;
  private _levelScene: LevelScene;
  private loaded: boolean = false;
  public readonly virtual: boolean;

  constructor(levelScene: LevelScene) {
    this.levelScene = levelScene;
    this.virtual = levelScene == null;
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
      if (!this.virtual) {
        this.levelScene.Unload();
        this.levelScene = null;
      }
      this.loaded = false;
    }
  }

  public SolveLevel(index: integer, levelParser: LevelParser) {
    this.LoadLevel(index, levelParser);
    const solver = new Solver();
    solver.Solve(this.dynamicState);
    solver.ReportVictoryPaths();
  }

  public LoadLevel(index: integer, levelParser: LevelParser) {
    levelParser.LoadLevelInfo(index);

    this.staticState = new StaticState(
      levelParser.levelFile.width,
      levelParser.levelFile.height,
      this.levelScene
    );
    this.dynamicState = new DynamicState(
      this.staticState,
      new Inventory(this.virtual),
      this.levelScene
    );

    new CameraManager(this.dynamicState);

    levelParser.BuildLevel(this);
    this.loaded = true;
  }
}

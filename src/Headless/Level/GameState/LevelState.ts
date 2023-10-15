import ILevelScene from 'PhaserStubs/ILevelScene';
import DynamicState from 'Headless/Level/GameState/DynamicState';
import StaticState from 'Headless/Level/GameState/StaticState';
import Inventory from 'Headless/Level/GameState/Inventory';
import LevelParser from 'Headless/Level/Generation/AssetLoading/LevelParser';
import Solver from 'Headless/Level/GameState/Solver';

export default class LevelState {
  private _staticState: StaticState;
  private _dynamicState: DynamicState;
  private _levelScene: ILevelScene;
  private loaded: boolean = false;
  public readonly virtual: boolean;

  constructor(levelScene: ILevelScene) {
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
  get levelScene(): ILevelScene {
    return this._levelScene;
  }
  private set levelScene(v: ILevelScene) {
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
    this.LoadLevel(index, levelParser, new Inventory());
    const solver = new Solver();
    solver.Solve(this.dynamicState);
    solver.ReportVictoryPaths();
  }

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

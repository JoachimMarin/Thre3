import ILevelScene from 'PhaserStubs/ILevelScene';
import LevelParser from 'Game/Level/Generation/AssetLoading/LevelParser';
import LevelState from 'Game/Level/GameState/LevelState';
import Inventory from 'Game/Level/GameState/Inventory';
import LevelList from 'Game/Level/Generation/AssetDefinitions/LevelList';
import Solver from './Level/GameState/Solver';

export default abstract class GameManager {
  private static parser: LevelParser;
  private static levelScene: ILevelScene;
  private static inventory: () => Inventory;
  private static levelState: LevelState = null;
  private static _levelIndex: integer = -1;

  static get levelIndex(): integer {
    return this._levelIndex;
  }

  static Init(
    parser: LevelParser,
    levelScene: ILevelScene,
    inventory: () => Inventory
  ) {
    this.parser = parser;
    this.levelScene = levelScene;
    this.inventory = inventory;
  }

  public static LoadLevel(index: integer) {
    this._levelIndex = index;
    // clear previous level state
    if (this.levelState != null) {
      this.levelState.UnloadLevel();
    }
    // create new level state
    this.levelState = new LevelState(this.levelScene);

    // load level for state and scene
    this.levelState.LoadLevel(index, this.parser, this.inventory());
    if (this.levelScene != null) {
      // the new level might have different dimensions, so the scene may have to be adjusted
      this.levelScene.LoadLevel(this.levelState);
    }
  }

  public static SolveLevel(index: integer) {
    this.LoadLevel(index);
    const solver = new Solver();
    // override defeat and victory while running solver
    {
      const _defeat = this.Defeat;
      const _victory = this.Victory;
      this.Defeat = () => solver.Defeat();
      this.Victory = () => solver.Victory();
      solver.Solve(this.levelState.dynamicState);
      this.Defeat = _defeat;
      this.Victory = _victory;
    }
    solver.ReportVictoryPaths(this.levelState.dynamicState);
  }

  public static Defeat() {
    this.RestartLevel();
  }

  public static Victory() {
    this.NextLevel();
  }

  private static RestartLevel() {
    this.LoadLevel(this._levelIndex);
  }

  private static NextLevel() {
    if (this._levelIndex + 1 < LevelList.length) {
      this.LoadLevel(this._levelIndex + 1);
    }
  }

  public static Update(_time: number, delta: number) {
    this.levelState.dynamicState.Update(delta);
  }
}

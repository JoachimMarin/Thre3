import Inventory from 'Game/Level/GameState/Inventory';
import LevelState from 'Game/Level/GameState/LevelState';
import Solver, { Path } from 'Game/Level/GameState/Solver';
import LevelList from 'Game/Level/Generation/AssetDefinitions/LevelList';
import LevelParser from 'Game/Level/Generation/AssetLoading/LevelParser';
import LevelScene from 'Phaser/LevelScene';
import { Vec2 } from 'Utils/Math/GridPoint';

export default abstract class GameManager {
  private static parser: LevelParser;
  private static levelScene: LevelScene;
  private static inventory: () => Inventory;
  private static _levelState: LevelState;
  private static _levelIndex: integer = -1;

  static get levelIndex(): integer {
    return this._levelIndex;
  }

  static get levelState(): LevelState {
    return this._levelState;
  }

  static Init(
    parser: LevelParser,
    levelScene: LevelScene,
    inventory: () => Inventory
  ) {
    this.parser = parser;
    this.levelScene = levelScene;
    this.inventory = inventory;
  }

  public static LoadLevel(index: integer) {
    this._levelIndex = index;
    // clear previous level state
    if (this._levelState !== undefined) {
      this._levelState.UnloadLevel();
    }
    // create new level state
    this._levelState = new LevelState(this.levelScene);

    // load level for state and scene
    this._levelState.LoadLevel(index, this.parser, this.inventory());
  }

  public static SolveLevel(index: integer): [Path, Vec2] {
    this.LoadLevel(index);
    let result: [Path, Vec2];
    this.RunSolver((solver) => {
      result = solver.Solve(this._levelState.dynamicState);
    });
    return result;
  }

  public static VerifyLevel(index: integer) {
    this.LoadLevel(index);
    let verified = false;
    this.RunSolver((solver) => {
      verified = solver.Verify(
        this._levelState.dynamicState,
        this.parser.levelFile.pathString
      );
    });
    return verified;
  }

  private static RunSolver(func: (solver: Solver) => void) {
    const solver = new Solver();
    const _defeat = this.Defeat;
    const _victory = this.Victory;
    this.Defeat = () => solver.Defeat();
    this.Victory = () => solver.Victory();
    func(solver);
    this.Defeat = _defeat;
    this.Victory = _victory;
  }

  public static Defeat() {
    this.RestartLevel();
  }

  public static Victory() {
    this.NextLevel();
  }

  public static RestartLevel() {
    this.LoadLevel(this._levelIndex);
  }

  private static NextLevel() {
    if (this._levelIndex + 1 < LevelList.length) {
      this.LoadLevel(this._levelIndex + 1);
    }
  }

  public static Update(_time: number, delta: number) {
    this._levelState.dynamicState.Update(delta);
  }
}

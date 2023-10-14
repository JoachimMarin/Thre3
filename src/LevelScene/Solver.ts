import { Vec2 } from 'Math/GridPoint';
import Direction from 'Math/Direction';
import DynamicState from 'Level/DynamicState';

enum Result {
  Pending,
  Victory,
  Defeat
}

class KnownStates {
  public map = new Map<string, Map<string, Vec2[]>>();

  public AddState(newState: DynamicState, newPath: Vec2[]) {
    const posKey =
      '[' + newState.player.position.x + ',' + newState.player.position.y + ']';
    if (!this.map.has(posKey)) {
      this.map.set(posKey, new Map<string, Vec2[]>());
    }
    const stateMap = this.map.get(posKey);
    const stateKey = newState.GetStateKeyString();
    if (stateMap.has(stateKey)) {
      const currentPath = stateMap.get(stateKey);
      if (newPath.length < currentPath.length) {
        stateMap.set(stateKey, newPath);
      } else {
        // same state with shorter path already exists -> discard current path
        return false;
      }
    } else {
      stateMap.set(stateKey, newPath);
    }
    return true;
  }
}

export default class Solver {
  private static result = Result.Pending;
  private knownStates: KnownStates = new KnownStates();
  private counter: number = 0;
  private pathLength: number = 0;

  static Defeat() {
    this.result = Result.Defeat;
  }

  static Victory() {
    this.result = Result.Victory;
  }

  ReportVictoryPaths() {
    console.log('possible paths:');
    for (const path of this.victoryPaths) {
      let pathString = '';
      for (const dir of path) {
        pathString += ' ' + dir;
      }
      console.log(pathString);
    }
  }

  Solve(state: DynamicState) {
    console.time('Solver');
    this._Solve(state, []);
    console.timeEnd('Solver');
  }

  private victoryPaths: Vec2[][] = [];

  private AddVictoryPath(path: Vec2[]) {
    this.victoryPaths.push(path);
  }

  private _Solve(state: DynamicState, path: Vec2[]) {
    const directions = [
      Direction.RIGHT,
      Direction.DOWN,
      Direction.LEFT,
      Direction.UP
    ];
    const queue: [DynamicState, Vec2[]][] = [[state, path]];
    while (queue.length > 0) {
      const [state, path] = queue.shift();
      if (path.length > this.pathLength) {
        this.pathLength = path.length;
        console.log('path length = ' + this.pathLength);
      }

      for (const dir of directions) {
        const tile = state.player.position.Translate(dir);
        if (state.player.CanMoveTo(tile)) {
          Solver.result = Result.Pending;
          const newState = state.DeepVirtualCopy();
          newState.player.destination = tile;
          newState.BeginPlayerStep();
          newState.player.SetGridPosition(newState.player.destination);
          newState.player.EndPlayerStep();
          const newPath = [...path];
          newPath.push(tile);
          if (Solver.result == Result.Pending) {
            if (this.knownStates.AddState(newState, newPath)) {
              queue.push([newState, newPath]);
            }
          } else if (Solver.result == Result.Victory) {
            console.log(
              'Found path of length ' +
                newPath.length +
                ' in ' +
                this.counter +
                ' search steps.'
            );
            this.AddVictoryPath(newPath);
            return;
          }
        }
      }
    }
  }
}

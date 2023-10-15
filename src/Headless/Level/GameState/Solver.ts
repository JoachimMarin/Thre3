import Direction from 'Headless/Utils/Math/Direction';
import DynamicState from 'Headless/Level/GameState/DynamicState';

enum Result {
  Pending,
  Victory,
  Defeat
}

class Path {
  public readonly prev: Path;
  public readonly direction: integer;
  public readonly length: integer;
  constructor(direction: integer, prev: Path = null) {
    this.prev = prev;
    this.direction = direction;
    if (prev == null) {
      this.length = 1;
    } else {
      this.length = prev.length + 1;
    }
  }
}

class KnownStates {
  public map = new Map<string, Map<string, Path>>();

  public AddState(newState: DynamicState, newPath: Path) {
    const posKey =
      '[' + newState.player.position.x + ',' + newState.player.position.y + ']';
    if (!this.map.has(posKey)) {
      this.map.set(posKey, new Map<string, Path>());
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
      let current = path;
      const pathArray: integer[] = [];
      while (current != null) {
        pathArray.push(current.direction);
        current = current.prev;
      }
      pathArray.reverse();
      for (const dir of pathArray) {
        pathString += Direction.ALL[dir] + ', ';
      }

      console.log(pathString);
    }
  }

  Solve(state: DynamicState) {
    console.time('Solver');
    this._Solve(state, null);
    console.timeEnd('Solver');
  }

  private victoryPaths: Path[] = [];

  private AddVictoryPath(path: Path) {
    this.victoryPaths.push(path);
  }

  private _Solve(state: DynamicState, path: Path) {
    const queue: [DynamicState, Path][] = [[state.DeepVirtualCopy(), path]];

    while (queue.length > 0 && this.victoryPaths.length == 0) {
      const [state, path] = queue.shift();
      this.counter++;
      if (path != null && path.length > this.pathLength) {
        this.pathLength = path.length;
        console.log('queued = ' + queue.length);
        console.log('path length = ' + this.pathLength);
        console.log('break');
      }

      for (const dir of Direction.ALL) {
        const tile = state.player.position.Translate(dir);
        if (state.player.CanMoveTo(tile)) {
          Solver.result = Result.Pending;
          const newState = state.DeepVirtualCopy();
          newState.player.destination = tile;
          newState.BeginPlayerStep();
          newState.player.SetGridPosition(newState.player.destination);
          newState.player.EndPlayerStep();
          const newPath = new Path(dir.id, path);
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
            break;
          }
        }
      }
      state.Unload();
    }
  }
}

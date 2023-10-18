import DynamicState from 'Game/Level/GameState/DynamicState';
import Direction from 'Utils/Math/Direction';


enum Result {
  Pending,
  Victory,
  Defeat
}

class Path {
  public readonly prev: Path;
  public readonly direction: integer;
  public readonly length: integer;
  constructor(direction: integer, prev: Path = undefined) {
    this.prev = prev;
    this.direction = direction;
    if (prev == undefined) {
      this.length = 1;
    } else {
      this.length = prev.length + 1;
    }
  }
}

class KnownStates {
  public map: { [pos: integer]: { [key: string]: Path } } = {};

  public AddState(newState: DynamicState, newPath: Path) {
    const playerKey = newState.GetPlayerKey();

    if (!(playerKey in this.map)) {
      this.map[playerKey] = {};
    }
    const stateMap = this.map[playerKey];
    const stateKey = newState.GetStateKeyString();
    if (stateKey in stateMap) {
      const currentPath = stateMap[stateKey];
      if (newPath.length < currentPath.length) {
        stateMap[stateKey] = newPath;
      } else {
        // same state with shorter path already exists -> discard current path
        return false;
      }
    } else {
      stateMap[stateKey] = newPath;
    }
    return true;
  }
}

/**
 * BFS based solver.
 */
export default class Solver {
  private result = Result.Pending;
  private knownStates: KnownStates = new KnownStates();
  private counter: number = 0;
  private pathLength: number = 0;

  Defeat() {
    this.result = Result.Defeat;
  }

  Victory() {
    this.result = Result.Victory;
    console.log('?');
  }

  ReportVictoryPaths(initialState: DynamicState) {
    console.log('possible paths:');
    for (const path of this.victoryPaths) {
      let pathString = '';
      let current = path;
      const pathArray: integer[] = [];
      while (current != undefined) {
        pathArray.push(current.direction);
        current = current.prev;
      }
      pathArray.reverse();
      let pos = initialState.player.position;
      for (const dirId of pathArray) {
        const dir = Direction.ALL[dirId];
        pos = pos.Translate(dir);
        pathString += dir.toString().padStart(5, ' ') + ' => ' + pos + '\n';
      }

      console.log(pathString);
    }
  }

  Solve(initialState: DynamicState) {
    console.time('Solver');
    this._Solve(initialState, undefined);
    console.timeEnd('Solver');
  }

  private victoryPaths: Path[] = [];

  private AddVictoryPath(path: Path) {
    this.victoryPaths.push(path);
  }

  private _Solve(initialState: DynamicState, path: Path) {
    const queue: [DynamicState, Path][] = [
      [initialState.DeepVirtualCopy(), path]
    ];

    while (queue.length > 0 && this.victoryPaths.length == 0) {
      const [state, path] = queue.shift();
      this.counter++;
      if (path != undefined && path.length > this.pathLength) {
        this.pathLength = path.length;
        console.log('queued = ' + queue.length);
        console.log('path length = ' + this.pathLength);
        console.log('break');
      }

      for (const dir of Direction.ALL) {
        const tile = state.player.position.Translate(dir);
        if (state.player.CanMoveTo(tile)) {
          this.result = Result.Pending;
          const newState = state.DeepVirtualCopy();
          newState.player.destination = tile;
          newState.BeginPlayerStep();
          newState.player.SetGridPosition(newState.player.destination);
          newState.player.EndPlayerStep();
          const newPath = new Path(dir.id, path);
          if (this.result == Result.Pending) {
            if (this.knownStates.AddState(newState, newPath)) {
              queue.push([newState, newPath]);
            }
          } else if (this.result == Result.Victory) {
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

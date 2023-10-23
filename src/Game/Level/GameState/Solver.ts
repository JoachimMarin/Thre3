import DynamicState from 'Game/Level/GameState/DynamicState';
import Direction from 'Utils/Math/Direction';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';

enum Result {
  Pending,
  Victory,
  Defeat
}

export class Path {
  public readonly prev: Path;
  public readonly direction: integer;
  public readonly length: integer;
  constructor(direction: integer, prev: Path = undefined) {
    this.prev = prev;
    this.direction = direction;
    if (prev === undefined) {
      this.length = 1;
    } else {
      this.length = prev.length + 1;
    }
  }

  toArray() {
    let current: Path = this;
    const pathArray: integer[] = [];
    while (current !== undefined) {
      pathArray.push(current.direction);
      current = current.prev;
    }
    return pathArray.reverse();
  }

  static fromString(str: string): Path {
    const noPos = str.replace(/ => \[\d*, \d*\]/g, '');
    let usesDirString = false;
    for (const dir of Direction.ALL) {
      if (noPos.indexOf(dir.name) !== -1) {
        usesDirString = true;
      }
    }
    const patterns = [];
    for (const dir of Direction.ALL) {
      if (usesDirString) {
        patterns.push('(' + dir.name + ')');
      } else {
        patterns.push('(' + dir.id.toString() + ')');
      }
    }

    const regex = RegExp(patterns.join('|'), 'g');
    let current = undefined;
    for (const match of noPos.matchAll(regex)) {
      if (usesDirString) {
        current = new Path(Direction.fromString(match[0]).id, current);
      } else {
        current = new Path(parseInt(match[0]), current);
      }
    }
    return current;
  }

  toString(
    sep: string = '',
    useDirString: boolean = false,
    start: IVec2 = undefined
  ) {
    const pathArray = this.toArray();
    const stringArray: string[] = [];
    if (start === undefined) {
      for (const dirId of pathArray) {
        const dir = Direction.ALL[dirId];
        stringArray.push(
          useDirString ? dir.toString().padStart(5, ' ') : dir.id.toString()
        );
      }
    } else {
      let pos = Vec2.AsVec2(start);
      for (const dirId of pathArray) {
        const dir = Direction.ALL[dirId];
        pos = pos.Translate(dir);
        stringArray.push(
          (useDirString ? dir.toString().padStart(5, ' ') : dir.id.toString()) +
            ' => ' +
            pos
        );
      }
    }

    return stringArray.join(sep);
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
  }

  Solve(initialState: DynamicState): [Path, Vec2] {
    console.time('Solver');
    const queue: [DynamicState, Path][] = [
      [initialState.DeepVirtualCopy(), undefined]
    ];

    console.log('Queue[0]=1');
    while (queue.length > 0) {
      const [state, path] = queue.shift();
      this.counter++;

      if (path === undefined) {
        console.log('Queue[1]=' + (queue.length + 1));
      } else if (path.length > this.pathLength) {
        this.pathLength = path.length;
        console.log(
          'Queue[' + (this.pathLength + 1) + ']=' + (queue.length + 1)
        );
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
          if (this.result === Result.Pending) {
            if (this.knownStates.AddState(newState, newPath)) {
              queue.push([newState, newPath]);
            }
          } else if (this.result === Result.Victory) {
            console.log(
              'Found path of length ' +
                newPath.length +
                ' in ' +
                this.counter +
                ' search steps.'
            );
            return [newPath, initialState.player.position];
          }
        }
      }
      state.Unload();
    }
    console.timeEnd('Solver');
    return undefined;
  }

  Verify(initialState: DynamicState, pathString: string) {
    const pathArray = Path.fromString(pathString).toArray();
    const state = initialState.DeepVirtualCopy();
    for (const dirId of pathArray) {
      const dir = Direction.ALL[dirId];
      const tile = state.player.position.Translate(dir);
      if (state.player.CanMoveTo(tile)) {
        state.player.destination = tile;
        state.BeginPlayerStep();
        state.player.SetGridPosition(state.player.destination);
        state.player.EndPlayerStep();
        if (this.result === Result.Defeat) {
          return false;
        } else if (this.result === Result.Victory) {
          return true;
        }
      } else {
        return false;
      }
    }
    return false;
  }
}

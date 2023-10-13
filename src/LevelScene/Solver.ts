import { Vec2 } from 'Math/GridPoint';
import LevelState from './LevelState';
import Direction from 'Math/Direction';

enum Result {
  Pending,
  Victory,
  Defeat
}

class KnownStates {
  public map = new Map<string, Map<string, Vec2[]>>();

  public AddState(newState: LevelState, newPath: Vec2[]) {
    const posKey =
      '[' + newState.player.position.x + ',' + newState.player.position.y + ']';
    if (!this.map.has(posKey)) {
      this.map.set(posKey, new Map<string, Vec2[]>());
    }
    const stateMap = this.map.get(posKey);
    const stateKey = newState.GetStateString();
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

  static Defeat() {
    this.result = Result.Defeat;
  }

  static Victory() {
    this.result = Result.Victory;
  }

  private victoryPaths: Vec2[][] = [];

  constructor(state: LevelState) {
    console.time('Solver');
    this.Solve(state, []);
    console.timeEnd('Solver');
  }

  AddVictoryPath(path: Vec2[]) {
    this.victoryPaths.push(path);
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

  Solve(state: LevelState, path: Vec2[]) {
    const directions = [
      Direction.RIGHT,
      Direction.DOWN,
      Direction.LEFT,
      Direction.UP
    ];
    const queue: [LevelState, Vec2[]][] = [[state, path]];
    while (queue.length > 0) {
      const [state, path] = queue.shift();
      this.counter++;
      if (this.counter % 1000 == 0) {
        console.log(this.counter);
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
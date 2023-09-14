import GridObject from './GridObjects/GridObject';
import { GridTags } from './Constants/GridTags';
import LevelScene from './LevelScene';
import GridPoint from './Math/GridPoint';
import { GridObjectEvent } from './Constants/GridObjectEvent';
import Player from './GridObjects/Player';
import Inventory from './Inventory';

class EventGroup {
  public objects: Set<GridObject> = new Set<GridObject>();
  public condition: (obj: GridObject) => boolean;

  constructor(condition: (obj: GridObject) => boolean) {
    this.condition = condition;
  }
}

export default class LevelGrid {
  public at: Set<GridObject>[][];
  public readonly levelScene: LevelScene;
  private playerStep = 0;
  private playerMaxStep = 3;
  public player: Player = null;
  public readonly inventory: Inventory;

  public readonly width: integer;
  public readonly height: integer;
  private objectGroups: Map<GridObjectEvent, EventGroup> = new Map<
    GridObjectEvent,
    EventGroup
  >();

  constructor(levelScene: LevelScene, width: integer, height: integer) {
    this.levelScene = levelScene;
    this.inventory = new Inventory(levelScene);
    this.width = width;
    this.height = height;
    this.at = [];
    for (let x = 0; x < width; x++) {
      this.at[x] = [];
      for (let y = 0; y < height; y++) {
        this.at[x][y] = new Set<GridObject>();
      }
    }
    this.DefineEventGroups();
  }

  DefineEventGroups() {
    const hasEvent = (func: (...args: any[]) => void) => {
      const functionString: string = func.toString().replace(/\s/g, '');
      const first = functionString.indexOf('{}');
      return first == -1 || first != functionString.lastIndexOf('{}');
    };
    this.DefineEventGroup(GridObjectEvent.UPDATE, (obj) =>
      hasEvent(obj.OnUpdate)
    );
    this.DefineEventGroup(GridObjectEvent.BEGIN_STEP_ALL, (obj) =>
      hasEvent(obj.OnBeginStep)
    );
    this.DefineEventGroup(GridObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
      hasEvent(obj.OnBeginStepTrigger)
    );
    this.DefineEventGroup(GridObjectEvent.END_STEP_ALL, (obj) =>
      hasEvent(obj.OnEndStep)
    );
    this.DefineEventGroup(GridObjectEvent.END_STEP_TRIGGER, (obj) =>
      hasEvent(obj.OnEndStepTrigger)
    );
  }

  SetupEventGroups(obj: GridObject) {
    for (const objectGroup of this.objectGroups.values()) {
      if (objectGroup.condition(obj)) {
        objectGroup.objects.add(obj);
      }
    }
  }

  ClearEventGroups(obj: GridObject) {
    for (const objectGroup of this.objectGroups.values()) {
      objectGroup.objects.delete(obj);
    }
  }

  ForEventGroup(key: GridObjectEvent, func: (obj: GridObject) => void) {
    for (const object of this.objectGroups.get(key).objects) {
      func(object);
    }
  }

  DefineEventGroup(
    key: GridObjectEvent,
    condition: (obj: GridObject) => boolean
  ) {
    this.objectGroups.set(key, new EventGroup(condition));
  }

  IsInBoundsXY(x: integer, y: integer) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
  IsInBounds(point: GridPoint) {
    return this.IsInBoundsXY(point.x, point.y);
  }

  HasGridTagXY(x: integer, y: integer, tag: GridTags) {
    const objectsAtGridPosition = this.at[x][y];
    for (const object of objectsAtGridPosition) {
      if (object.HasGridTag(tag)) {
        return true;
      }
    }
    return false;
  }

  HasGridTag(point: GridPoint, tag: GridTags) {
    return this.HasGridTagXY(point.x, point.y, tag);
  }

  GetByTagXY(x: integer, y: integer, tag: GridTags): GridObject[] {
    const objectsAtGridPosition = this.at[x][y];
    const array = [];
    for (const object of objectsAtGridPosition) {
      if (object.HasGridTag(tag)) {
        array.push(object);
      }
    }
    return array;
  }

  GetByTag(point: GridPoint, tag: GridTags): GridObject[] {
    return this.GetByTagXY(point.x, point.y, tag);
  }

  Update(delta: number) {
    this.ForEventGroup(GridObjectEvent.UPDATE, (obj) => obj.OnUpdate(delta));
  }

  BeginPlayerStep() {
    let trigger = false;
    this.playerStep--;
    if (this.playerStep == 0) {
      trigger = true;
    } else if (this.playerStep < 0) {
      this.playerStep = this.playerMaxStep - 1;
    }
    this.ForEventGroup(GridObjectEvent.BEGIN_STEP_ALL, (obj) =>
      obj.OnBeginStep(trigger)
    );
    if (trigger) {
      this.ForEventGroup(GridObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
        obj.OnBeginStepTrigger()
      );
    }
  }

  EndPlayerStep() {
    const trigger = this.playerStep == 0;
    this.ForEventGroup(GridObjectEvent.END_STEP_ALL, (obj) =>
      obj.OnEndStep(trigger)
    );
    if (trigger) {
      this.ForEventGroup(GridObjectEvent.END_STEP_TRIGGER, (obj) =>
        obj.OnEndStepTrigger()
      );
    }
  }
}

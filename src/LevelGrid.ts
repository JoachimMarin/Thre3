import GridObject from 'GameObjects/BaseClasses/GridObject';
import ObjectTag from 'Constants/ObjectTag';
import LevelScene from 'LevelScene';
import GridPoint from 'Math/GridPoint';
import GameObjectEvent from 'Constants/GridObjectEvent';
import Player from 'GameObjects/PrePlaced/Player';
import Inventory from 'Inventory';
import GameObject from 'GameObjects/BaseClasses/GameObject';

class EventGroup {
  public objects: Set<GameObject> = new Set<GameObject>();
  public condition: (obj: GameObject) => boolean;

  constructor(condition: (obj: GameObject) => boolean) {
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
  private objectGroups: Map<GameObjectEvent, EventGroup> = new Map<
    GameObjectEvent,
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
    this.DefineEventGroup(GameObjectEvent.UPDATE, (obj) =>
      hasEvent(obj.OnUpdate)
    );
    this.DefineEventGroup(GameObjectEvent.BEGIN_STEP_ALL, (obj) =>
      hasEvent(obj.OnBeginStep)
    );
    this.DefineEventGroup(GameObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
      hasEvent(obj.OnBeginStepTrigger)
    );
    this.DefineEventGroup(GameObjectEvent.END_STEP_ALL, (obj) =>
      hasEvent(obj.OnEndStep)
    );
    this.DefineEventGroup(GameObjectEvent.END_STEP_TRIGGER, (obj) =>
      hasEvent(obj.OnEndStepTrigger)
    );
  }

  SetupEventGroups(obj: GameObject) {
    for (const objectGroup of this.objectGroups.values()) {
      if (objectGroup.condition(obj)) {
        objectGroup.objects.add(obj);
      }
    }
  }

  ClearEventGroups(obj: GameObject) {
    for (const objectGroup of this.objectGroups.values()) {
      objectGroup.objects.delete(obj);
    }
  }

  ForEventGroup(key: GameObjectEvent, func: (obj: GameObject) => void) {
    for (const object of this.objectGroups.get(key).objects) {
      func(object);
    }
  }

  DefineEventGroup(
    key: GameObjectEvent,
    condition: (obj: GameObject) => boolean
  ) {
    this.objectGroups.set(key, new EventGroup(condition));
  }

  IsInBoundsXY(x: integer, y: integer) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
  IsInBounds(point: GridPoint) {
    return this.IsInBoundsXY(point.x, point.y);
  }

  HasGridTagXY(x: integer, y: integer, tag: ObjectTag) {
    const objectsAtGridPosition = this.at[x][y];
    for (const object of objectsAtGridPosition) {
      if (object.HasTag(tag)) {
        return true;
      }
    }
    return false;
  }

  HasGridTag(point: GridPoint, tag: ObjectTag) {
    return this.HasGridTagXY(point.x, point.y, tag);
  }

  GetByTagXY(x: integer, y: integer, tag: ObjectTag): GridObject[] {
    const objectsAtGridPosition = this.at[x][y];
    const array = [];
    for (const object of objectsAtGridPosition) {
      if (object.HasTag(tag)) {
        array.push(object);
      }
    }
    return array;
  }

  GetByTag(point: GridPoint, tag: ObjectTag): GridObject[] {
    return this.GetByTagXY(point.x, point.y, tag);
  }

  Update(delta: number) {
    this.ForEventGroup(GameObjectEvent.UPDATE, (obj) => obj.OnUpdate(delta));
  }

  BeginPlayerStep() {
    let trigger = false;
    this.playerStep--;
    if (this.playerStep == 0) {
      trigger = true;
    } else if (this.playerStep < 0) {
      this.playerStep = this.playerMaxStep - 1;
    }
    this.ForEventGroup(GameObjectEvent.BEGIN_STEP_ALL, (obj) =>
      obj.OnBeginStep(trigger)
    );
    if (trigger) {
      this.ForEventGroup(GameObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
        obj.OnBeginStepTrigger()
      );
    }
  }

  EndPlayerStep() {
    const trigger = this.playerStep == 0;
    this.ForEventGroup(GameObjectEvent.END_STEP_ALL, (obj) =>
      obj.OnEndStep(trigger)
    );
    if (trigger) {
      this.ForEventGroup(GameObjectEvent.END_STEP_TRIGGER, (obj) =>
        obj.OnEndStepTrigger()
      );
    }
  }
}

import GameObjectEvent from 'Headless/Level/Events/GridObjectEvent';
import GameObject from 'Headless/Level/GameObjects/BaseClasses/GameObject';
import GridObjectChanges from 'Headless/Level/GameState/GridObjectChanges';
import GridObjectDynamic from 'Headless/Level/GameObjects/BaseClasses/GridObjectDynamic';
import GridObjectStatic from 'Headless/Level/GameObjects/BaseClasses/GridObjectStatic';
import { IVec2, Vec2 } from 'Headless/Utils/Math/GridPoint';
import StaticState from 'Headless/Level/GameState/StaticState';
import Player from 'Headless/Level/GameObjects/PrePlaced/Player';
import Inventory from 'Headless/Level/GameState/Inventory';
import EventGroupDefintions from 'Headless/Level/Events/EventGroupDefintions';
import ObjectTag from 'Headless/Level/GameObjects/ObjectTag';
import GridObject from 'Headless/Level/GameObjects/BaseClasses/GridObject';
import ILevelScene from 'PhaserStubs/ILevelScene';

/**
 * Contains all game objects and manages level related gameplay.
 */
export default class DynamicState {
  static GridKeyXY(x: number, y: number) {
    return x + y * 1000;
  }

  static GridKeyPoint(point: Vec2) {
    return DynamicState.GridKeyXY(point.x, point.y);
  }

  public staticObjectChanges = new Map<GridObjectStatic, GridObjectChanges>();
  public dynamicObjects = new Map<number, Set<GridObjectDynamic>>();
  public dynamicEventObjects = new Map<GameObjectEvent, Set<GameObject>>();
  public staticState: StaticState | null;

  private playerStep = 0;
  private playerMaxStep = 3;
  public player: Player = null;
  public inventory: Inventory;
  private changesKeyString: string;
  private dynamicsKeyString: string;
  public lockGridKey: boolean = true;

  public readonly levelScene: ILevelScene;
  public readonly virtual: boolean;

  constructor(
    staticState: StaticState,
    inventory: Inventory,
    levelScene: ILevelScene
  ) {
    this.staticState = staticState;
    this.inventory = inventory;
    this.levelScene = levelScene;
    this.virtual = levelScene == null;
  }

  DeepVirtualCopy() {
    const copy = new DynamicState(
      this.staticState,
      this.inventory.DeepVirtualCopy(),
      null
    );
    copy.player = this.player.DeepCopy(copy);
    copy.playerStep = this.playerStep;
    copy.playerMaxStep = this.playerMaxStep;
    copy.changesKeyString = this.changesKeyString;
    copy.dynamicsKeyString = this.dynamicsKeyString;
    copy.lockGridKey = true;

    this.dynamicObjects.forEach((set, _) => {
      for (const gridObject of set) {
        gridObject.DeepCopy(copy);
      }
    });

    this.staticObjectChanges.forEach((changes, obj) => {
      copy.staticObjectChanges.set(obj, changes.DeepCopy());
    });

    copy.lockGridKey = false;
    return copy;
  }

  UpdateChangesKeyString() {
    if (this.lockGridKey) {
      return;
    }

    this.changesKeyString = '';
    const changedObjects: GridObjectStatic[] = [];
    for (const changedObject of this.staticObjectChanges.keys()) {
      changedObjects.push(changedObject);
    }
    changedObjects.sort((a, b) => a._id - b._id);
    for (const changedObject of changedObjects) {
      this.changesKeyString +=
        '[' +
        changedObject._id +
        ':' +
        this.staticObjectChanges.get(changedObject).GetKeyString() +
        ']';
    }
  }

  UpdateDynamicsKeyString() {
    if (this.lockGridKey) {
      return;
    }

    this.dynamicsKeyString = '#';
    const dynamicGridKeys = [];
    for (const gridKey of this.dynamicObjects.keys()) {
      dynamicGridKeys.push(gridKey);
    }
    dynamicGridKeys.sort();
    for (const gridKey of dynamicGridKeys) {
      const dynamicSet = this.dynamicObjects.get(gridKey);
      if (dynamicSet.size > 0) {
        this.dynamicsKeyString += '[' + gridKey + ':';
        // TODO: use deterministic order if multiple dynamic grid objects in same location
        for (const dynamicObject of dynamicSet) {
          this.dynamicsKeyString += dynamicObject.GetKeyString() + ']';
        }
      }
    }
  }

  UpdateGridKeyString() {
    this.UpdateChangesKeyString();
    this.UpdateDynamicsKeyString();
  }

  GetStateKeyString() {
    const playerString =
      this.player.position.x +
      ',' +
      this.player.position.y +
      '|' +
      this.playerStep +
      '/' +
      this.playerMaxStep;
    return (
      this.changesKeyString +
      '\n' +
      this.dynamicsKeyString +
      '\n' +
      this.inventory.GetKey() +
      '\n' +
      playerString
    );
  }

  /**
   * Adds Gameobject obj to all relevant EventGroups
   * @param obj
   */
  SetupEventGroups(obj: GameObject) {
    for (const [event, condition] of EventGroupDefintions) {
      if (condition(obj)) {
        if (!this.dynamicEventObjects.has(event)) {
          this.dynamicEventObjects.set(event, new Set<GameObject>());
        }
        this.dynamicEventObjects.get(event).add(obj);
      }
    }
  }

  /**
   * Removes Gameobject obj from all EventGroups
   * @param obj
   */
  ClearEventGroups(obj: GameObject) {
    for (const [event, condition] of EventGroupDefintions) {
      if (condition(obj)) {
        if (this.dynamicEventObjects.has(event)) {
          this.dynamicEventObjects.get(event).delete(obj);
        }
      }
    }
  }

  /**
   * Runs function func for every obj that has GameObjectEvent key.
   * @param key
   * @param func
   */
  ForEventGroup(key: GameObjectEvent, func: (obj: GameObject) => void) {
    if (this.staticState.eventGroups.has(key)) {
      for (const object of this.staticState.eventGroups.get(key)) {
        if (object.Exists(this)) {
          func(object);
        }
      }
    }
    if (this.dynamicEventObjects.has(key)) {
      for (const object of this.dynamicEventObjects.get(key)) {
        func(object);
      }
    }
  }

  /**
   * Returns true, if point is inside the level bounds.
   * @param point
   * @returns
   */
  IsInBounds(point: IVec2) {
    const gridPoint = Vec2.AsVec2(point);
    return (
      gridPoint.x >= 0 &&
      gridPoint.y >= 0 &&
      gridPoint.x < this.staticState.width &&
      gridPoint.y < this.staticState.height
    );
  }
  /**
   * Returns true, if any GridObject located at point has ObjectTag tag.
   * @param point
   * @param tag
   * @returns
   */
  HasGridTag(point: IVec2, tag: ObjectTag) {
    const gridPoint = Vec2.AsVec2(point);
    const gridKey = DynamicState.GridKeyPoint(gridPoint);

    if (this.staticState.staticTags.has(gridKey)) {
      if (this.staticState.staticTags.get(gridKey).has(tag)) {
        return true;
      }
    }
    if (this.staticState.staticObjects.has(gridKey)) {
      for (const object of this.staticState.staticObjects.get(gridKey)) {
        if (object.Exists(this) && object.HasTag(this, tag)) {
          return true;
        }
      }
    }

    if (this.dynamicObjects.has(gridKey)) {
      for (const object of this.dynamicObjects.get(gridKey)) {
        if (object.HasTag(this, tag)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Returns an array of GridObjects located at point that have ObjectTag tag.
   * @param point
   * @param tag
   * @returns
   */
  GetByTag(point: IVec2, tag: ObjectTag): GridObject[] {
    const gridPoint = Vec2.AsVec2(point);
    const gridKey = DynamicState.GridKeyPoint(gridPoint);

    const array = [];

    if (this.staticState.staticObjects.has(gridKey)) {
      for (const object of this.staticState.staticObjects.get(gridKey)) {
        if (object.Exists(this) && object.HasTag(this, tag)) {
          array.push(object);
        }
      }
    }

    if (this.dynamicObjects.has(gridKey)) {
      for (const object of this.dynamicObjects.get(gridKey)) {
        if (object.HasTag(this, tag)) {
          array.push(object);
        }
      }
    }

    return array;
  }

  /**
   * Runs on cene update.
   * @param delta Time since the last scene update.
   */
  Update(delta: number) {
    this.inventory.Update();
    this.ForEventGroup(GameObjectEvent.UPDATE, (obj) =>
      obj.OnUpdate(this, delta)
    );
  }

  /**
   * The player starts moving away from a tile.
   */
  BeginPlayerStep() {
    let trigger = false;
    this.playerStep--;
    if (this.playerStep == 0) {
      trigger = true;
    } else if (this.playerStep < 0) {
      this.playerStep = this.playerMaxStep - 1;
    }
    this.ForEventGroup(GameObjectEvent.BEGIN_STEP_ALL, (obj) =>
      obj.OnBeginStep(this, trigger)
    );
    if (trigger) {
      this.ForEventGroup(GameObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
        obj.OnBeginStepTrigger(this)
      );
    }
  }

  /**
   * The player reaches a tile.
   */
  EndPlayerStep() {
    const trigger = this.playerStep == 0;
    this.ForEventGroup(GameObjectEvent.END_STEP_ALL, (obj) =>
      obj.OnEndStep(this, trigger)
    );
    if (trigger) {
      this.ForEventGroup(GameObjectEvent.END_STEP_TRIGGER, (obj) =>
        obj.OnEndStepTrigger(this)
      );
    }
  }

  /**
   * Removes all data governed by this DynamicState.
   */
  Unload() {
    if (this.dynamicEventObjects.has(GameObjectEvent.GLOBAL_SCENE)) {
      for (const obj of this.dynamicEventObjects.get(
        GameObjectEvent.GLOBAL_SCENE
      )) {
        obj.Unload(this.virtual);
      }
    }
    this.staticObjectChanges.clear();
    this.dynamicObjects.clear();
    this.dynamicEventObjects.clear();
    this.inventory.Clear();
  }
}

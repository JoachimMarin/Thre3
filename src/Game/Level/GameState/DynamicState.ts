import EventGroup from 'Game/Level/Events/GridObjectEvent';
import GameObject from 'Game/Level/GameObjects/BaseClasses/GameObject';
import GridObjectChanges from 'Game/Level/GameState/GridObjectChanges';
import GridObjectDynamic from 'Game/Level/GameObjects/BaseClasses/GridObjectDynamic';
import GridObjectStatic from 'Game/Level/GameObjects/BaseClasses/GridObjectStatic';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';
import StaticState from 'Game/Level/GameState/StaticState';
import Player from 'Game/Level/GameObjects/PrePlaced/Player';
import Inventory from 'Game/Level/GameState/Inventory';
import EventGroupDefintions from 'Game/Level/Events/EventGroupDefintions';
import ObjectTag from 'Game/Level/GameObjects/ObjectTag';
import GridObject from 'Game/Level/GameObjects/BaseClasses/GridObject';
import ILevelScene from 'PhaserStubs/ILevelScene';
import ByteArray from 'Utils/Math/ByteArray';

/**
 * Contains all changes to the level state compared to the initial static state.
 */
export default class DynamicState {
  public staticObjectChanges = new Map<GridObjectStatic, integer>();
  public dynamicObjects = new Map<number, Set<GridObjectDynamic>>();
  public dynamicEventObjects = new Map<EventGroup, Set<GameObject>>();
  public staticState: StaticState | null;

  private playerStep = 0;
  private playerMaxStep = 3;
  public player: Player = null;
  public inventory: Inventory;
  private static changesSizeFactor = 2 + GridObjectChanges.GetByteArraySize();
  private changesKeyString: Uint8Array;
  private static dynamicSizeFactor = 2 + GridObjectDynamic.GetByteArraySize();
  private dynamicsKeyString: Uint8Array;
  private playerKeyString: Uint8Array = new Uint8Array(4);

  public lockGridKey: boolean = true;

  public readonly levelScene: ILevelScene;

  constructor(
    staticState: StaticState,
    inventory: Inventory,
    levelScene: ILevelScene
  ) {
    this.staticState = staticState;
    this.inventory = inventory;
    this.levelScene = levelScene;
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
      copy.staticObjectChanges.set(obj, changes);
    });

    copy.lockGridKey = false;
    return copy;
  }

  UpdateChangesKeyString() {
    if (this.lockGridKey) {
      return;
    }

    this.changesKeyString = new Uint8Array(
      DynamicState.changesSizeFactor * this.staticObjectChanges.size
    );

    const changedObjects: GridObjectStatic[] = [];
    for (const changedObject of this.staticObjectChanges.keys()) {
      changedObjects.push(changedObject);
    }
    changedObjects.sort((a, b) => a._id - b._id);
    for (let i = 0; i < changedObjects.length; i++) {
      const changedObject = changedObjects[i];
      ByteArray.Write16(
        this.changesKeyString,
        i * DynamicState.changesSizeFactor,
        changedObject._id
      );
      GridObjectChanges.WriteByteArray(
        this.changesKeyString,
        i * DynamicState.changesSizeFactor + 2,
        this.staticObjectChanges.get(changedObject)
      );
    }
  }

  UpdateDynamicsKeyString() {
    if (this.lockGridKey) {
      return;
    }

    this.dynamicsKeyString = new Uint8Array(
      DynamicState.dynamicSizeFactor * this.dynamicObjects.size
    );
    const dynamicGridKeys = [];
    for (const gridKey of this.dynamicObjects.keys()) {
      dynamicGridKeys.push(gridKey);
    }
    dynamicGridKeys.sort();

    for (let i = 0; i < dynamicGridKeys.length; i++) {
      const gridKey = dynamicGridKeys[i];
      const dynamicSet = this.dynamicObjects.get(gridKey);

      // TODO: use deterministic order if multiple dynamic grid objects in same location
      for (const dynamicObject of dynamicSet) {
        ByteArray.Write16(
          this.dynamicsKeyString,
          i * DynamicState.dynamicSizeFactor,
          gridKey
        );
        dynamicObject.WriteByteArray(
          this.dynamicsKeyString,
          i * DynamicState.dynamicSizeFactor + 2
        );
      }
    }
  }

  UpdateGridKeyString() {
    this.UpdateChangesKeyString();
    this.UpdateDynamicsKeyString();
  }

  GetPlayerKey() {
    this.playerKeyString[0] = this.player.position.x;
    this.playerKeyString[1] = this.player.position.y;
    this.playerKeyString[2] = this.playerStep;
    this.playerKeyString[3] = this.playerMaxStep;
    return this.playerKeyString.toString();
  }

  GetStateKeyString() {
    return (
      this.changesKeyString.toString() +
      '|' +
      this.dynamicsKeyString.toString() +
      '|' +
      this.inventory.GetKey().toString()
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
  ForEventGroup(key: EventGroup, func: (obj: GameObject) => void) {
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
    const gridKey = Vec2.AsVec2(point).toInt16();

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
    const gridKey = Vec2.AsVec2(point).toInt16();

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
    this.ForEventGroup(EventGroup.UPDATE, (obj) => obj.OnUpdate(this, delta));
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
    this.ForEventGroup(EventGroup.BEGIN_STEP_ALL, (obj) =>
      obj.OnBeginStep(this, trigger)
    );
    if (trigger) {
      this.ForEventGroup(EventGroup.BEGIN_STEP_TRIGGER, (obj) =>
        obj.OnBeginStepTrigger(this)
      );
    }
  }

  /**
   * The player reaches a tile.
   */
  EndPlayerStep() {
    const trigger = this.playerStep == 0;
    this.ForEventGroup(EventGroup.END_STEP_ALL, (obj) =>
      obj.OnEndStep(this, trigger)
    );
    if (trigger) {
      this.ForEventGroup(EventGroup.END_STEP_TRIGGER, (obj) =>
        obj.OnEndStepTrigger(this)
      );
    }
  }

  /**
   * Removes all data governed by this DynamicState.
   */
  Unload() {
    if (this.dynamicEventObjects.has(EventGroup.ALL)) {
      for (const obj of this.dynamicEventObjects.get(EventGroup.ALL)) {
        obj.Unload();
      }
    }
    this.dynamicEventObjects.clear();
    this.staticObjectChanges.clear();
    this.dynamicObjects.clear();
    this.inventory.Clear();
  }
}

import GridObject from 'GameObjects/BaseClasses/GridObject';
import ObjectTag from 'Constants/ObjectTag';
import LevelScene from 'LevelScene/LevelScene';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GameObjectEvent from 'Constants/GridObjectEvent';
import Player from 'GameObjects/PrePlaced/Player';
import Inventory from 'LevelScene/Inventory';
import GameObject from 'GameObjects/BaseClasses/GameObject';
import ClassUtils from 'Utils/ClassUtils';

/**
 * An EventGroup is a set of GameObjects that share a certain event.
 * @see GameObjectEvent
 */
class EventGroup {
  public objects: Set<GameObject> = new Set<GameObject>();
  public condition: (obj: GameObject) => boolean;

  constructor(condition: (obj: GameObject) => boolean) {
    this.condition = condition;
  }
}

/**
 * Contains all game objects and manages level related gameplay.
 */
export default class LevelState {
  public at: Set<GridObject>[][];
  public readonly levelScene: LevelScene;
  public readonly virtual: boolean;
  private playerStep = 0;
  private playerMaxStep = 3;
  public player: Player = null;
  public inventory: Inventory;
  private background: Phaser.GameObjects.Rectangle;
  private gridKey: string;
  public lockGridKey: boolean = true;

  public readonly width: integer;
  public readonly height: integer;
  private eventGroups: Map<GameObjectEvent, EventGroup> = new Map<
    GameObjectEvent,
    EventGroup
  >();

  constructor(levelScene: LevelScene | null, width: integer, height: integer) {
    this.virtual = levelScene == null;
    this.levelScene = levelScene;
    this.inventory = new Inventory(this.virtual);
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

    if (!this.virtual) {
      this.background = levelScene.add
        .rectangle(0, 0, width, height, 0xaabbcc)
        .setOrigin(0, 0);
    }
  }

  DeepVirtualCopy() {
    const copy = new LevelState(null, this.width, this.height);
    copy.playerStep = this.playerStep;
    copy.playerMaxStep = this.playerMaxStep;
    copy.inventory = this.inventory.DeepVirtualCopy();
    copy.gridKey = this.gridKey;
    copy.lockGridKey = true;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (const gridObject of this.at[x][y]) {
          gridObject.DeepCopy(copy);
        }
      }
    }
    copy.lockGridKey = false;
    return copy;
  }

  ComputeGridKey() {
    if (this.lockGridKey) {
      return;
    }
    this.gridKey = '' + this.width + '|' + this.height + '|';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const objectsAt: string[] = [];
        for (const gridObject of this.at[x][y]) {
          if (gridObject.UpdateGridKey()) {
            objectsAt.push((gridObject as unknown).constructor.name);
          }
        }
        objectsAt.sort();
        this.gridKey += objectsAt.join(',').padStart(15, ' ') + '|';
      }
      this.gridKey += '\n';
    }
  }

  GetKey() {
    const playerString =
      this.player.position.x +
      '|' +
      this.player.position.y +
      '|' +
      this.playerStep +
      '/' +
      this.playerMaxStep;
    return this.gridKey + this.inventory.GetKey() + '|' + playerString;
  }

  /**
   * Defines a new EventGroup for GameObjectEvent key for GameObjects fulfilling condition.
   * @param key
   * @param condition
   */
  DefineEventGroup(
    key: GameObjectEvent,
    condition: (obj: GameObject) => boolean
  ) {
    this.eventGroups.set(key, new EventGroup(condition));
  }

  DefineEventGroups() {
    // Check whether a GameObject has a certain event
    // All GameObjects in the scene
    this.DefineEventGroup(GameObjectEvent.GLOBAL_SCENE, (_obj) => true);
    // GameObjects that override an event function:
    // .OnUpdate
    this.DefineEventGroup(GameObjectEvent.UPDATE, (obj) =>
      ClassUtils.IsImplemented(obj.OnUpdate)
    );
    // .OnBeginStep
    this.DefineEventGroup(GameObjectEvent.BEGIN_STEP_ALL, (obj) =>
      ClassUtils.IsImplemented(obj.OnBeginStep)
    );
    // .OnBeginStepTrigger
    this.DefineEventGroup(GameObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
      ClassUtils.IsImplemented(obj.OnBeginStepTrigger)
    );
    // .OnEndStep
    this.DefineEventGroup(GameObjectEvent.END_STEP_ALL, (obj) =>
      ClassUtils.IsImplemented(obj.OnEndStep)
    );
    // .OnEndStepTrigger
    this.DefineEventGroup(GameObjectEvent.END_STEP_TRIGGER, (obj) =>
      ClassUtils.IsImplemented(obj.OnEndStepTrigger)
    );
  }

  /**
   * Adds Gameobject obj to all relevant EventGroups
   * @param obj
   */
  SetupEventGroups(obj: GameObject) {
    for (const eventGroup of this.eventGroups.values()) {
      if (eventGroup.condition(obj)) {
        eventGroup.objects.add(obj);
      }
    }
  }

  /**
   * Removes Gameobject obj from all EventGroups
   * @param obj
   */
  ClearEventGroups(obj: GameObject) {
    for (const eventGroup of this.eventGroups.values()) {
      eventGroup.objects.delete(obj);
    }
  }

  /**
   * Runs function func for every obj that has GameObjectEvent key.
   * @param key
   * @param func
   */
  ForEventGroup(key: GameObjectEvent, func: (obj: GameObject) => void) {
    for (const object of this.eventGroups.get(key).objects) {
      func(object);
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
      gridPoint.x < this.width &&
      gridPoint.y < this.height
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
    const objectsAtGridPosition = this.at[gridPoint.x][gridPoint.y];
    for (const object of objectsAtGridPosition) {
      if (object.HasTag(tag)) {
        return true;
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
    const objectsAtGridPosition = this.at[gridPoint.x][gridPoint.y];
    const array = [];
    for (const object of objectsAtGridPosition) {
      if (object.HasTag(tag)) {
        array.push(object);
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
    this.ForEventGroup(GameObjectEvent.UPDATE, (obj) => obj.OnUpdate(delta));
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
      obj.OnBeginStep(trigger)
    );
    if (trigger) {
      this.ForEventGroup(GameObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
        obj.OnBeginStepTrigger()
      );
    }
  }

  /**
   * The player reaches a tile.
   */
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

  /**
   * Removes all data governed by this LevelState.
   */
  Remove() {
    this.ForEventGroup(GameObjectEvent.GLOBAL_SCENE, (obj) => {
      obj.Remove();
    });
    this.inventory.Clear();
    if (!this.virtual) {
      this.background.destroy();
    }
  }
}

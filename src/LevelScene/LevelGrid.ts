import GridObject from 'GameObjects/BaseClasses/GridObject';
import ObjectTag from 'Constants/ObjectTag';
import LevelScene from 'LevelScene/LevelScene';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GameObjectEvent from 'Constants/GridObjectEvent';
import Player from 'GameObjects/PrePlaced/Player';
import Inventory from 'LevelScene/Inventory';
import GameObject from 'GameObjects/BaseClasses/GameObject';

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
export default class LevelGrid {
  public at: Set<GridObject>[][];
  public readonly levelScene: LevelScene;
  private playerStep = 0;
  private playerMaxStep = 3;
  public player: Player = null;
  public readonly inventory: Inventory;
  private background: Phaser.GameObjects.Rectangle;

  public readonly width: integer;
  public readonly height: integer;
  private eventGroups: Map<GameObjectEvent, EventGroup> = new Map<
    GameObjectEvent,
    EventGroup
  >();

  constructor(levelScene: LevelScene, width: integer, height: integer) {
    this.levelScene = levelScene;
    this.inventory = new Inventory();
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

    this.background = levelScene.add
      .rectangle(0, 0, width, height, 0xaabbcc)
      .setOrigin(0, 0);
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
    // This is done by checking whether the function body of the event function contains any code
    const hasEvent = (func: (...args: any[]) => void) => {
      const functionString: string = func.toString().replace(/\s/g, '');
      const first = functionString.indexOf('{}');
      return first == -1 || first != functionString.lastIndexOf('{}');
    };
    // All GameObjects in the scene
    this.DefineEventGroup(GameObjectEvent.GLOBAL_SCENE, (_obj) => true);
    // GameObjects that override an event function:
    // .OnUpdate
    this.DefineEventGroup(GameObjectEvent.UPDATE, (obj) =>
      hasEvent(obj.OnUpdate)
    );
    // .OnBeginStep
    this.DefineEventGroup(GameObjectEvent.BEGIN_STEP_ALL, (obj) =>
      hasEvent(obj.OnBeginStep)
    );
    // .OnBeginStepTrigger
    this.DefineEventGroup(GameObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
      hasEvent(obj.OnBeginStepTrigger)
    );
    // .OnEndStep
    this.DefineEventGroup(GameObjectEvent.END_STEP_ALL, (obj) =>
      hasEvent(obj.OnEndStep)
    );
    // .OnEndStepTrigger
    this.DefineEventGroup(GameObjectEvent.END_STEP_TRIGGER, (obj) =>
      hasEvent(obj.OnEndStepTrigger)
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
   * Removes all data governed by this LevelGrid.
   */
  Remove() {
    this.ForEventGroup(GameObjectEvent.GLOBAL_SCENE, (obj) => {
      obj.Remove();
    });
    this.inventory.Clear();
    this.background.destroy();
  }
}

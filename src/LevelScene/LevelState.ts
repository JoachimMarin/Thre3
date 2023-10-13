import GridObject from 'GameObjects/BaseClasses/GridObject';
import ObjectTag from 'Constants/ObjectTag';
import LevelScene from 'LevelScene/LevelScene';
import { IVec2, Vec2 } from 'Math/GridPoint';
import GameObjectEvent from 'Constants/GridObjectEvent';
import Player from 'GameObjects/PrePlaced/Player';
import Inventory from 'LevelScene/Inventory';
import GameObject from 'GameObjects/BaseClasses/GameObject';
import ClassUtils from 'Utils/ClassUtils';
import GridObjectChanges from 'GameObjects/BaseClasses/GridObjectChanges';
import GridObjectDynamic from 'GameObjects/BaseClasses/GridObjectDynamic';
import GridObjectStatic from 'GameObjects/BaseClasses/GridObjectStatic';

export class StaticState {
  public staticObjects = new Map<number, Set<GridObjectStatic>>();
  public staticTags = new Map<number, Set<ObjectTag>>();

  public eventGroups = new Map<GameObjectEvent, (obj: GameObject) => boolean>();
  public staticEventObjects = new Map<GameObjectEvent, Set<GameObject>>();

  constructor() {
    this.DefineEventGroups();
  }

  /**
   * Adds Gameobject obj to all relevant EventGroups
   * @param obj
   */
  SetupEventGroups(obj: GameObject) {
    for (const [event, condition] of this.eventGroups) {
      if (condition(obj)) {
        if (!this.staticEventObjects.has(event)) {
          this.staticEventObjects.set(event, new Set<GameObject>());
        }
        this.staticEventObjects.get(event).add(obj);
      }
    }
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
    this.eventGroups.set(key, condition);
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
}

/**
 * Contains all game objects and manages level related gameplay.
 */
export default class LevelState {
  static GridKeyXY(x: number, y: number) {
    return x + y * 10000;
  }

  static GridKeyPoint(point: Vec2) {
    return LevelState.GridKeyXY(point.x, point.y);
  }

  public staticObjectChanges = new Map<GridObject, GridObjectChanges>();
  public dynamicObjects = new Map<number, Set<GridObjectDynamic>>();
  public dynamicEventObjects = new Map<GameObjectEvent, Set<GameObject>>();
  public staticState = new StaticState();

  public readonly levelScene: LevelScene;
  public readonly virtual: boolean;
  private playerStep = 0;
  private playerMaxStep = 3;
  public player: Player = null;
  public inventory: Inventory;
  private background: Phaser.GameObjects.Rectangle;
  public staticImages: Phaser.GameObjects.Image[] = [];
  private gridString: string;
  public lockGridKey: boolean = true;

  public readonly width: integer;
  public readonly height: integer;

  constructor(levelScene: LevelScene | null, width: integer, height: integer) {
    this.virtual = levelScene == null;
    this.levelScene = levelScene;
    this.inventory = new Inventory(this.virtual);
    this.width = width;
    this.height = height;

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
    copy.gridString = this.gridString;
    copy.lockGridKey = true;
    copy.staticState = this.staticState;

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

  ComputeGridString() {
    /*if (this.lockGridKey) {
      return;
    }
    this.gridString = '' + this.width + '|' + this.height + '|';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const objectsAt: string[] = [];

        const gridKey = LevelState.GridKeyXY(x, y);
        if (this.at.has(gridKey)) {
          for (const gridObject of this.at.get(gridKey)) {
            if (gridObject.UpdateGridKey()) {
              objectsAt.push((gridObject as unknown).constructor.name);
            }
          }
        }
        objectsAt.sort();
        this.gridString += objectsAt.join(',').padStart(15, ' ') + '|';
      }
      this.gridString += '\n';
    }*/
  }

  GetStateString() {
    /*const playerString =
      this.player.position.x +
      '|' +
      this.player.position.y +
      '|' +
      this.playerStep +
      '/' +
      this.playerMaxStep;
    return this.gridString + this.inventory.GetKey() + '|' + playerString;*/
    return '';
  }

  /**
   * Adds Gameobject obj to all relevant EventGroups
   * @param obj
   */
  SetupEventGroups(obj: GameObject) {
    for (const [event, condition] of this.staticState.eventGroups) {
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
    for (const [event, condition] of this.staticState.eventGroups) {
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
    if (this.staticState.staticEventObjects.has(key)) {
      for (const object of this.staticState.staticEventObjects.get(key)) {
        func(object);
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
    const gridKey = LevelState.GridKeyPoint(gridPoint);

    if (this.staticState.staticTags.has(gridKey)) {
      if (this.staticState.staticTags.get(gridKey).has(tag)) {
        return true;
      }
    }
    if (this.staticState.staticObjects.has(gridKey)) {
      for (const object of this.staticState.staticObjects.get(gridKey)) {
        if (object.HasTag(this, tag)) {
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
    const gridKey = LevelState.GridKeyPoint(gridPoint);

    const array = [];

    if (this.staticState.staticObjects.has(gridKey)) {
      for (const object of this.staticState.staticObjects.get(gridKey)) {
        if (object.HasTag(this, tag)) {
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
   * Removes all data governed by this LevelState.
   */
  Remove() {
    this.ForEventGroup(GameObjectEvent.GLOBAL_SCENE, (obj) => {
      obj.Remove(this);
    });
    this.inventory.Clear();
    if (!this.virtual) {
      this.background.destroy();
      for (const image of this.staticImages) {
        image.destroy();
      }
    }
  }
}

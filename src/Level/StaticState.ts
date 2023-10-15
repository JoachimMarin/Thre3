import GameObjectEvent from 'Constants/GridObjectEvent';
import ObjectTag from 'Constants/ObjectTag';
import GridObjectStatic from 'GameObjects/BaseClasses/GridObjectStatic';
import EventGroupDefintions from 'Level/EventGroupDefintions';
import ILevelScene from './ILevelScene';

export default class StaticState {
  public staticObjects = new Map<number, Set<GridObjectStatic>>();
  public staticTags = new Map<number, Set<ObjectTag>>();
  public eventGroups = new Map<GameObjectEvent, Set<GridObjectStatic>>();

  public readonly width: integer;
  public readonly height: integer;

  public readonly levelScene: ILevelScene;
  public readonly virtual: boolean;

  constructor(width: integer, height: integer, levelScene: ILevelScene) {
    this.width = width;
    this.height = height;
    this.levelScene = levelScene;
    this.virtual = levelScene == null;
  }

  /**
   * Adds Gameobject obj to all relevant EventGroups
   * @param obj
   */
  SetupEventGroups(obj: GridObjectStatic) {
    for (const [event, condition] of EventGroupDefintions) {
      if (condition(obj)) {
        if (!this.eventGroups.has(event)) {
          this.eventGroups.set(event, new Set<GridObjectStatic>());
        }
        this.eventGroups.get(event).add(obj);
      }
    }
  }

  Unload() {
    if (this.eventGroups.has(GameObjectEvent.GLOBAL_SCENE)) {
      for (const obj of this.eventGroups.get(GameObjectEvent.GLOBAL_SCENE)) {
        obj.Unload(this.virtual);
      }
    }
    this.staticObjects.clear();
    this.staticTags.clear();
    this.eventGroups.clear();
  }
}

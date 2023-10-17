import EventGroup from 'Game/Level/Events/GridObjectEvent';
import ObjectTag from 'Game/Level/GameObjects/ObjectTag';
import GridObjectStatic from 'Game/Level/GameObjects/BaseClasses/GridObjectStatic';
import EventGroupDefintions from 'Game/Level/Events/EventGroupDefintions';
import LevelScene from 'Phaser/LevelScene';
//import ILevelScene from 'PhaserStubs/ILevelScene';

export default class StaticState {
  public staticObjects = new Map<number, Set<GridObjectStatic>>();
  public staticTags = new Map<number, Set<ObjectTag>>();
  public eventGroups = new Map<EventGroup, Set<GridObjectStatic>>();

  public readonly width: integer;
  public readonly height: integer;

  public readonly levelScene: LevelScene;
  constructor(width: integer, height: integer, levelScene: LevelScene) {
    this.width = width;
    this.height = height;
    this.levelScene = levelScene;
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
    if (this.eventGroups.has(EventGroup.ALL)) {
      for (const obj of this.eventGroups.get(EventGroup.ALL)) {
        obj.Unload();
      }
    }
    this.staticObjects.clear();
    this.staticTags.clear();
    this.eventGroups.clear();
  }
}

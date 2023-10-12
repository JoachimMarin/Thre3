import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';

/**
 * GameObject:
 *  recieves events
 *  can have parent/child relationships with other GameObjects
 *  can have tags
 */
export default abstract class GameObject {
  public grid: LevelState;
  public tags = new Set<ObjectTag>();
  public children: Set<GameObject> = new Set<GameObject>();
  public parents: Set<GameObject> = new Set<GameObject>();
  private removed: boolean = false;

  constructor(grid: LevelState) {
    this.grid = grid;
  }

  PostConstruct() {
    this.grid.SetupEventGroups(this);
    this.OnInit();
  }

  AddChild(child: GameObject) {
    this.children.add(child);
    child.parents.add(this);
  }
  RemoveChild(child: GameObject) {
    this.children.delete(child);
    child.parents.delete(this);
  }

  Remove() {
    if (this.removed) {
      return;
    }
    this.removed = true;
    this.grid.ClearEventGroups(this);
    for (const parent of this.parents) {
      parent.RemoveChild(this);
    }
    for (const child of this.children) {
      child.Remove();
    }
    this.OnRemove();
  }

  HasTag(tag: ObjectTag) {
    return this.tags.has(tag);
  }
  AddTag(tag: ObjectTag) {
    this.tags.add(tag);
  }
  RemoveTag(tag: ObjectTag) {
    this.tags.delete(tag);
  }

  OnInit() {}
  OnRemove() {}
  OnBeginStep(_trigger: boolean) {}
  OnBeginStepTrigger() {}
  OnEndStep(_trigger: boolean) {}
  OnEndStepTrigger() {}
  OnUpdate(_delta: number) {}
}

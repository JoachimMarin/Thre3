import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';

/**
 * GameObject:
 *  recieves events
 *  can have parent/child relationships with other GameObjects
 *  can have tags
 */
export default abstract class GameObject {
  public static EMPTY_TAG_SET = new Set<ObjectTag>();
  public static EMPTY_OBJECT_SET = new Set<GameObject>();

  public grid: LevelState;
  private tags: Set<ObjectTag> | null = null;
  private children: Set<GameObject> | null = null;
  private parents: Set<GameObject> | null = null;
  private removed: boolean = false;

  constructor(grid: LevelState) {
    this.grid = grid;
  }

  PostConstruct() {
    this.grid.SetupEventGroups(this);
    this.OnInit();
  }

  GetStaticTags() {
    return GameObject.EMPTY_TAG_SET;
  }

  GetChildren() {
    if (this.children == null) {
      return GameObject.EMPTY_OBJECT_SET;
    } else {
      return this.children;
    }
  }

  GetParents() {
    if (this.parents == null) {
      return GameObject.EMPTY_OBJECT_SET;
    } else {
      return this.parents;
    }
  }

  AddChild(child: GameObject) {
    if (this.children == null) {
      this.children = new Set<GameObject>();
    }
    this.children.add(child);
    if (child.parents == null) {
      child.parents = new Set<GameObject>();
    }
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
    if (this.parents != null) {
      for (const parent of this.parents) {
        parent.RemoveChild(this);
      }
    }
    if (this.children != null) {
      for (const child of this.children) {
        child.Remove();
      }
    }
    this.OnRemove();
  }

  HasTag(tag: ObjectTag) {
    return (
      this.GetStaticTags().has(tag) || (this.tags != null && this.tags.has(tag))
    );
  }
  AddTag(tag: ObjectTag) {
    if (this.tags == null) {
      this.tags = new Set<ObjectTag>();
    }
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

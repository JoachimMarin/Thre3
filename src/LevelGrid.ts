import * as Phaser from 'phaser'

import GridObject from './GridObjects/GridObject'
import { GridTags } from './Constants/GridTags';
import LevelScene from './LevelScene';
import GridPoint from './Math/GridPoint';
import { GridObjectEvent } from './Constants/GridObjectEvent';

class ObjectGroup {
    public objects: Set<GridObject> = new Set<GridObject>();
    public condition: (obj: GridObject) => boolean;

    constructor(condition: (obj: GridObject) => boolean) {
        this.condition = condition;
    }
}

export default class LevelGrid {
    public at: Set<GridObject>[][];
    public readonly level_scene: LevelScene;
    private playerStep = 0;
    private playerMaxStep = 3;

    public readonly width: integer;
    public readonly height: integer;
    private objectGroups: Map<GridObjectEvent, ObjectGroup> = new Map<GridObjectEvent, ObjectGroup>();

    constructor(level_scene: LevelScene, width: integer, height: integer) {
        this.level_scene = level_scene;
        this.width = width;
        this.height = height;
        this.at = []
        for (var x = 0; x < width; x++) {
            this.at[x] = [];
            for (var y = 0; y < height; y++) {
                this.at[x][y] = new Set<GridObject>();
            }
        }
        this.InitObjectGroups();
    }

    InitObjectGroups() {
        const hasEvent = (func: (args:any) => any) => {
            const functionString : string = func.toString().replace(/\s/g, "");
            const first = functionString.indexOf("{}");
            return first == -1 || first != functionString.lastIndexOf("{}");
        }
        this.DefineObjectGroup(GridObjectEvent.UPDATE, obj => hasEvent(obj.OnUpdate));
        this.DefineObjectGroup(GridObjectEvent.BEGIN_STEP_ALL, obj => hasEvent(obj.OnBeginStep));
        this.DefineObjectGroup(GridObjectEvent.BEGIN_STEP_TRIGGER, obj => hasEvent(obj.OnBeginStepTrigger));
        this.DefineObjectGroup(GridObjectEvent.END_STEP_ALL, obj => hasEvent(obj.OnEndStep));
        this.DefineObjectGroup(GridObjectEvent.END_STEP_TRIGGER, obj => hasEvent(obj.OnEndStepTrigger));
    }

    SetupObjectGroups(obj: GridObject) {
        for (const objectGroup of this.objectGroups.values()) {
            if (objectGroup.condition(obj)) {
                objectGroup.objects.add(obj);
            }
        }
    }

    ClearObjectGroups(obj: GridObject) {
        for (const objectGroup of this.objectGroups.values()) {
            objectGroup.objects.delete(obj);
        }
    }

    ForGroup(key:GridObjectEvent,  func: (obj:GridObject) => void) {
        for (const object of this.objectGroups.get(key).objects) {
            func(object);
        }
    }

    DefineObjectGroup(key: GridObjectEvent, condition: (obj: GridObject) => boolean) {
        this.objectGroups.set(key,  new ObjectGroup(condition));
    }

    HasGridTagXY(x: integer, y: integer, tag: GridTags) {
        const objectsAtGridPosition = this.at[x][y];
        for (const object of objectsAtGridPosition) {
            if (object.HasGridTag(tag)) {
                return true;
            }
        }
        return false;
    }

    HasGridTag(point: GridPoint, tag: GridTags) {
        return this.HasGridTagXY(point.x, point.y, tag);
    }

    Update(delta: number) {
        this.ForGroup(GridObjectEvent.UPDATE, (obj) => obj.OnUpdate(delta))
    }


    BeginPlayerStep() {
        var trigger = false;
        this.playerStep--;
        if (this.playerStep == 0) {
            trigger = true;
        } else if(this.playerStep < 0) {
            this.playerStep = this.playerMaxStep - 1;
        }
        this.ForGroup(GridObjectEvent.BEGIN_STEP_ALL, (obj) => obj.OnBeginStep(trigger))
        if (trigger) {
            this.ForGroup(GridObjectEvent.BEGIN_STEP_TRIGGER, (obj) => obj.OnBeginStepTrigger())
        }
    }

    EndPlayerStep() {
        var trigger = this.playerStep == 0;
        this.ForGroup(GridObjectEvent.END_STEP_ALL, (obj) => obj.OnEndStep(trigger))
        if (trigger) {
            this.ForGroup(GridObjectEvent.END_STEP_TRIGGER, (obj) => obj.OnEndStepTrigger())
        }
    }
}

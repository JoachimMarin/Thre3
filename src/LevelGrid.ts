import * as Phaser from 'phaser'

import GridObject from './GridObjects/GridObject'
import Player from './GridObjects/Player';
import { GridTags } from './Constants/GridTags';
import LevelScene from './LevelScene';
import GridPoint from './Math/GridPoint';

export default class LevelGrid {
    public at: Set<GridObject>[][];
    public readonly level_scene: LevelScene;
    private playerStep = 0;

    public all: Set<GridObject> = new Set<GridObject>();
    public update: Set<GridObject> = new Set<GridObject>();
    public stepEventAll: Set<GridObject> = new Set<GridObject>();
    public stepEventTrigger: Set<GridObject> = new Set<GridObject>();
    public readonly width: integer;
    public readonly height: integer;

    constructor(level_scene: LevelScene, width:integer, height:integer) {
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
        for (const object of this.update) {
            object.UpdateEvent(delta);
        }
    }


    PlayerStep() {
        var trigger = false;
        this.playerStep++;
        if (this.playerStep >= 3) {
            this.playerStep = 0;
            trigger = true;
        }
        for (const object of this.stepEventAll) {
            object.StepEvent(trigger);
        }
        if (trigger) {
            for (const object of this.stepEventTrigger) {
                object.StepEventTrigger();
            }
        }
    }
}

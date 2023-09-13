import * as Phaser from 'phaser'

import GridObject from './GridObjects/GridObject'
import ProtectiveWall from './GridObjects/ProtectiveWall'
import Player from './GridObjects/Player';
import { GridTags } from './Constants/GridTags';
import LevelScene from './LevelScene';
import GreenGun from './GridObjects/GreenGun';

export default class LevelGrid {
    public at: Set<GridObject>[][];
    public readonly level_scene: LevelScene;
    private player: Player;
    private playerStep = 0;

    public all: Set<GridObject> = new Set<GridObject>();
    public stepEventAll: Set<GridObject> = new Set<GridObject>();
    public stepEventTrigger: Set<GridObject> = new Set<GridObject>();

    constructor(level_scene: LevelScene) {
        this.level_scene = level_scene;
        this.CreateLevel();
    }

    HasGridTag(x: integer, y: integer, tag: GridTags) {
        const objectsAtGridPosition = this.at[x][y];
        for (const object of objectsAtGridPosition) {
            if (object.HasGridTag(tag)) {
                return true;
            }
        }
        return false;
    }



    CreateLevel() {
        const gridWidth = 30;
        const gridHeight = 20;
        this.at = []
        for (var x = 0; x < gridWidth; x++) {
            this.at[x] = [];
            for (var y = 0; y < gridHeight; y++) {
                this.at[x][y] = new Set<GridObject>();
            }
        }


        for (var x = 0; x < gridWidth; x++) {
            new ProtectiveWall(x, 0, this)
            new ProtectiveWall(x, gridHeight - 1, this)
        }

        for (var y = 1; y < gridHeight - 1; y++) {
            new ProtectiveWall(0, y, this)
            new ProtectiveWall(gridWidth - 1, y, this)
        }
        this.player = new Player(1, 1, this);

        new GreenGun(4, 2, this);
        new GreenGun(3, 7, this);
    }


    Update(delta: number) {
        this.player.update(delta);
    }


    PlayerStep() {
        var trigger = false;
        if (this.playerStep >= 3) {
            this.playerStep = 0;
            trigger = true;
        }
        this.playerStep++;
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

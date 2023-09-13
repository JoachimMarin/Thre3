import * as Phaser from 'phaser';
import LevelScene from '../LevelScene';
import { GridTags } from '../Constants/GridTags';
import { Grid } from 'matter';
import LevelGrid from '../LevelGrid';

export default abstract class GridObject extends Phaser.GameObjects.GameObject {
    public x: integer;
    public y: integer;
    public grid: LevelGrid;
    public tags: { [id: string]: boolean } = {};

    constructor(x: integer, y: integer, grid: LevelGrid) {
        super(grid.level_scene, 'GridObject');
        this.x = x;
        this.y = y;
        this.grid = grid;
        this.AddToGrid();
        this.Init();

        this.grid.all.add(this);
        if (this.HasGridTag(GridTags.STEP_EVENT_ALL)) {
            this.grid.stepEventAll.add(this);
        }
        if (this.HasGridTag(GridTags.STEP_EVENT_TRIGGER)) {
            this.grid.stepEventTrigger.add(this);
        }
    }

    Remove() {
        this.grid.all.delete(this);
        this.grid.stepEventAll.delete(this);
        this.RemoveFromGrid();
        this.destroy();
    }

    RemoveFromGrid() {
        const objectsAtGridPosition = this.grid.at[this.x][this.y];
        objectsAtGridPosition.delete(this);
    }

    AddToGrid() {
        const objectsAtGridPosition = this.grid.at[this.x][this.y];
        objectsAtGridPosition.add(this);
    }

    SetGridPosition(x: integer, y: integer) {
        this.RemoveFromGrid();
        this.x = x;
        this.y = y;
        this.AddToGrid();
    }
    Init() { }

    HasGridTag(tag: GridTags) {
        return tag.toString() in this.tags;
    }
    AddGridTag(tag: GridTags) {
        this.tags[tag.toString()] = true;
    }
    RemoveGridTag(tag: GridTags) {
        delete this.tags[tag.toString()];
    }

    StepEvent(trigger: boolean) { }
    StepEventTrigger() { }
}

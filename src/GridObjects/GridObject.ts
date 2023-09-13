import * as Phaser from 'phaser';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import GridPoint from '../Math/GridPoint';

export default abstract class GridObject extends Phaser.GameObjects.GameObject {
    public position: GridPoint;
    public grid: LevelGrid;
    public tags: { [id: string]: boolean } = {};

    constructor(x: integer, y: integer, grid: LevelGrid) {
        super(grid.level_scene, 'GridObject');
        this.position = new GridPoint(x, y);
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
        const objectsAtGridPosition = this.grid.at[this.position.x][this.position.y];
        objectsAtGridPosition.delete(this);
    }

    AddToGrid() {
        const objectsAtGridPosition = this.grid.at[this.position.x][this.position.y];
        objectsAtGridPosition.add(this);
    }


    SetGridPosition(position: GridPoint) {
        this.RemoveFromGrid();
        this.position = position;
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

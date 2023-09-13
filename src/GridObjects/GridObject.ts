import * as Phaser from 'phaser';
import LevelScene from '../LevelScene';
import { GridTags } from '../Constants/GridTags';

export default abstract class GridObject extends Phaser.GameObjects.GameObject {
    public x: integer;
    public y: integer;
    public level_scene: LevelScene;
    public tags: {[id: string]: boolean} = {};

    constructor(x: integer, y: integer, level_scene: LevelScene) {
        super(level_scene, 'GridObject');
        this.x = x;
        this.y = y;
        this.level_scene = level_scene;
        this.AddToGrid();
    }

    RemoveFromGrid() {
        const objectList = this.level_scene.grid[this.x][this.y];
        for (var i = 0; i < objectList.length; i++) {
            if (objectList[i] == this) {
                const last = objectList.pop();
                if (i < objectList.length) {
                    objectList[i] = last;
                }
                return true;
            }
        }
        return false;
    }

    AddToGrid() {
        const objectList = this.level_scene.grid[this.x][this.y];
        for (var i = 0; i < objectList.length; i++) {
            if (objectList[i] == this) {
                return false;
            }
        }
        this.level_scene.grid[this.x][this.y].push(this);
        return true;
    }

    SetGridPosition(x: integer, y: integer) {
        this.RemoveFromGrid();
        this.x = x;
        this.y = y;
        this.AddToGrid();
    }

    Remove() {
        this.RemoveFromGrid();
        this.destroy();
    }

    HasGridTag(tag:GridTags) {
        return tag.toString() in this.tags;
    }
    AddGridTag(tag:GridTags) {
        this.tags[tag.toString()] = true;
    }
    RemoveGridTag(tag:GridTags) {
        delete this.tags[tag.toString()];
    }
}

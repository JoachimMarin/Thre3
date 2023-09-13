import * as Phaser from 'phaser';
import GridObjectStatic from './GridObjectStatic';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';

export default class BlueWall extends GridObjectStatic {
    constructor(x: integer, y: integer, grid:LevelGrid) {
        super(x, y, grid)
    }

    Init() {
        this.AddGridTag(GridTags.WALL);
    }

    GetImageKey(): string {
        return 'blue_wall';
    }
}

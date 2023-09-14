import * as Phaser from 'phaser';
import GridObjectStatic from './GridObjectStatic';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';

export default class Goal extends GridObjectStatic {
    constructor(x: integer, y: integer, grid:LevelGrid) {
        super(x, y, grid);
    }

    Init() {
        this.AddGridTag(GridTags.DESTROY_BULLETS);
    }

    GetImageKey(): string {
        return 'goal';
    }
}

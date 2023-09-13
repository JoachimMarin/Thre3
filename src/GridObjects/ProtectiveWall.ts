import * as Phaser from 'phaser';
import GridObjectStatic from './GridObjectStatic';
import LevelScene from '../LevelScene';
import { GridTags } from '../Constants/GridTags';

export default class ProtectiveWall extends GridObjectStatic {
    constructor(x: integer, y: integer, scene:LevelScene) {
        super(x, y, scene);
        this.AddGridTag(GridTags.WALL);
    }

    GetImageKey(): string {
        return 'protective_wall';
    }
}

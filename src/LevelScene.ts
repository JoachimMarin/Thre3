import * as Phaser from 'phaser'

import LevelGrid from './LevelGrid';
import LaserColor from './Constants/LaserColor';
import GridObject from './GridObjects/GridObject';
import { LevelParser} from './LevelParser';

export default class LevelScene extends Phaser.Scene {
    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    public readonly index: integer;
    private grid: LevelGrid;
    private levelParser: LevelParser = new LevelParser();
   
    constructor(index: integer) {
        super('level-' + index.toString())
        this.index = index
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    preload() {
        this.levelParser.Preload(this);
    }

    create() {
        this.grid = this.levelParser.BuildLevel();
    }


    update(_time: number, delta: number) {
        this.grid.Update(delta);
    }
}

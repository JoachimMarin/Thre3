import * as Phaser from 'phaser'

import GridObject from './GridObjects/GridObject'
import ProtectiveWall from './GridObjects/ProtectiveWall'
import Player from './GridObjects/Player';
import { GridTags } from './Constants/GridTags';

export default class LevelScene extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private index: integer;
    private player: Player;
    public grid: GridObject[][][];

    constructor(index: integer) {
        super('level-' + index.toString())
        this.index = index
    }

    HasGridTag(x:integer, y:integer, tag:GridTags) {
        const objectList = this.grid[x][y];
        for (var i = 0; i < objectList.length; i++) {
            if (objectList[i].HasGridTag(tag)) {
                return true;
            }
        }
        return false;
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    preload() {
        this.load.image('player', 'assets/player.png')
        this.load.image('wall', 'assets/blue_wall.png')
        this.load.image('protective_wall', 'assets/protective_wall.png')
        //this.load.image('destination', 'assets/destination.png')
        this.load.image('green_gun', 'assets/green_gun.png')
    }

    create() {
        const gridWidth = 30;
        const gridHeight = 20;
        this.grid = []
        for (var x = 0; x < gridWidth; x++) {
            this.grid[x] = [];
            for (var y = 0; y < gridHeight; y++) {
                this.grid[x][y] = [];
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
        this.player = new Player(1, 1, this, this.cursors);
    }


    update(time, delta) {
        this.player.update(delta);
    }
    

    PlayerStep() {

    }
}

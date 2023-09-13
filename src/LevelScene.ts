import * as Phaser from 'phaser'

import LevelGrid from './LevelGrid';
import LaserColor from './Constants/LaserColor';
import { getAllEnumValues } from 'enum-for'

export default class LevelScene extends Phaser.Scene {
    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    public index: integer;
    private grid: LevelGrid;

    constructor(index: integer) {
        super('level-' + index.toString())
        this.index = index
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('wall', 'assets/blue_wall.png');
        this.load.image('protective_wall', 'assets/protective_wall.png');
        //this.load.image('destination', 'assets/destination.png');

        for (const color of LaserColor.ALL) {
            console.log(color.name + '_gun', 'assets/' + color.name + '_gun.png');
            this.load.image(color.name + '_gun', 'assets/' + color.name + '_gun.png');
            this.load.image(color.name + '_projectile', 'assets/' + color.name + '_projectile.png');
            this.load.image(color.name + '_projectile_end', 'assets/' + color.name + '_projectile_end.png');
        }
    }

    create() {
        this.grid = new LevelGrid(this);
    }


    update(_time: number, delta: number) {
        this.grid.Update(delta);
    }
}

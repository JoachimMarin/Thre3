import * as Phaser from 'phaser';
import GridObject from './GridObject';
import LevelScene from '../LevelScene';
import { Direction } from '../Constants/Direction';
import { GridTags } from '../Constants/GridTags';

export default class Player extends GridObject {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private moving: boolean = false;
    private direction: Direction = Direction.DOWN;
    private destinationX: integer;
    private destinationY: integer;
    private sprite: Phaser.Physics.Arcade.Sprite;

    constructor(x: integer, y: integer, level_scene: LevelScene, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        super(x, y, level_scene)
        this.cursors = cursors;
        this.sprite = level_scene.physics.add.sprite(x * 128 + 64, y * 128 + 64, 'player');
        this.sprite.setDisplaySize(128, 128);
    }


    SetGridPosition(x: number, y: number): void {
        super.SetGridPosition(x, y);
    }

    update(delta : number): void {
        const speed = 0.6;
        if (this.moving) {
            if (this.direction == Direction.RIGHT) {
                this.sprite.x += speed * delta;
                if (this.sprite.x >= this.destinationX * 128 + 64) {
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                    this.level_scene.PlayerStep();
                } 
            } else if (this.direction == Direction.LEFT) {
                this.sprite.x -= speed * delta;
                if (this.sprite.x <= this.destinationX * 128 + 64) {
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                    this.level_scene.PlayerStep();
                }
            } else if (this.direction == Direction.UP) {
                this.sprite.y -= speed * delta;
                if (this.sprite.y <= this.destinationY * 128 + 64) {
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                    this.level_scene.PlayerStep();
                }
            } else if (this.direction == Direction.DOWN) {
                this.sprite.y += speed * delta;
                if (this.sprite.y >= this.destinationY * 128 + 64) {
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                    this.level_scene.PlayerStep();
                }
            }

        }

        if (!this.moving) {
            if (this.cursors.left.isDown) {
                this.moving = true;
                this.direction = Direction.LEFT;
                this.destinationX = this.x - 1;
                this.destinationY = this.y;
            } else if (this.cursors.right.isDown) {
                this.moving = true;
                this.direction = Direction.RIGHT;
                this.destinationX = this.x + 1;
                this.destinationY = this.y;
            } else if (this.cursors.up.isDown) {
                this.moving = true;
                this.direction = Direction.UP;
                this.destinationX = this.x;
                this.destinationY = this.y - 1;
            } else if (this.cursors.down.isDown) {
                this.moving = true;
                this.direction = Direction.DOWN;
                this.destinationX = this.x;
                this.destinationY = this.y + 1;
            }
            if (this.moving && this.level_scene.HasGridTag(this.destinationX, this.destinationY, GridTags.WALL)) {
                console.log("wall at destination");
                this.moving = false;
            }
        }
        if(!this.moving) {
            this.sprite.setPosition(this.x * 128 + 64, this.y * 128 + 64);
        }
    }

    /*update(...args: any[]): void {
        const speed = 256;
        const buffer = 8;
        if (this.moving) {
            if (this.direction == Direction.RIGHT) {
                if (this.sprite.x >= this.destinationX * 128 + 64 - buffer) {
                    console.log(this.sprite.x - (this.destinationX * 128 + 64));
                    this.sprite.setVelocity(0, 0);
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                }
            } else if (this.direction == Direction.LEFT) {
                if (this.sprite.x <= this.destinationX * 128 + 64 + buffer) {
                    this.sprite.setVelocity(0, 0);
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                }
            } else if (this.direction == Direction.UP) {
                if (this.sprite.y <= this.destinationY * 128 + 64 + buffer) {
                    this.sprite.setVelocity(0, 0);
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                }
            } else if (this.direction == Direction.DOWN) {
                if (this.sprite.y >= this.destinationY * 128 + 64 - buffer) {
                    this.sprite.setVelocity(0, 0);
                    this.moving = false;
                    this.SetGridPosition(this.destinationX, this.destinationY);
                }
            }
        }

        if (!this.moving) {
            if (this.cursors.left.isDown) {
                this.moving = true;
                this.direction = Direction.LEFT;
                this.destinationX = this.x - 1;
                this.destinationY = this.y;
                this.sprite.setVelocity(-speed, 0);
            } else if (this.cursors.right.isDown) {
                this.moving = true;
                this.direction = Direction.RIGHT;
                this.destinationX = this.x + 1;
                this.destinationY = this.y;
                this.sprite.setVelocity(speed, 0);
            } else if (this.cursors.up.isDown) {
                this.moving = true;
                this.direction = Direction.UP;
                this.destinationX = this.x;
                this.destinationY = this.y - 1;
                this.sprite.setVelocity(0, -speed);
            } else if (this.cursors.down.isDown) {
                this.moving = true;
                this.direction = Direction.DOWN;
                this.destinationX = this.x;
                this.destinationY = this.y + 1;
                this.sprite.setVelocity(0, speed);
            }
            if (this.moving && this.level_scene.HasGridTag(this.destinationX, this.destinationY, GridTags.WALL)) {
                console.log("wall at destination");
                this.moving = false;
                this.sprite.setVelocity(0, 0);
            }
        }
        if(!this.moving) {
            this.sprite.setPosition(this.x * 128 + 64, this.y * 128 + 64);
        }
    }*/
}

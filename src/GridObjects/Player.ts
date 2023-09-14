import * as Phaser from 'phaser';
import GridObject from './GridObject';
import { Direction } from '../Constants/Direction';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import GridPoint from '../Math/GridPoint';

export default class Player extends GridObject {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private moving: boolean = false;
    private direction: Direction = Direction.DOWN;
    private destination: GridPoint;
    private sprite: Phaser.Physics.Arcade.Sprite;
    private gameOver: boolean = false;

    constructor(x: integer, y: integer, grid: LevelGrid) {
        super(x, y, grid);
        this.grid.player = this;
        this.cursors = grid.level_scene.cursors;
        this.sprite = grid.level_scene.physics.add.sprite(this.position.realX(), this.position.realY(), 'player');
        this.sprite.setDisplaySize(128, 128);
    }

    GameOver() {
        this.gameOver = true;
        setTimeout(() => {
            this.grid.level_scene.scene.restart();    
        }, 2000);
    }

    OnUpdate(delta: number): void {
        const speed = 0.6;
        if (this.moving) {
            const translationVector = GridPoint.TranslationVector(this.direction);
            this.sprite.x += speed * delta * translationVector.x;
            this.sprite.y += speed * delta * translationVector.y;
            if (translationVector.x * this.sprite.x >= translationVector.x * this.destination.realX() &&
                translationVector.y * this.sprite.y >= translationVector.y * this.destination.realY()
            ) {
                this.moving = false;
                this.SetGridPosition(this.destination);
                this.grid.EndPlayerStep();
                if(this.grid.HasGridTag(this.position, GridTags.DEADLY)) {
                    this.GameOver();
                }
            }
        }

        if (!this.moving && !this.gameOver) {
            if (this.cursors.left.isDown) {
                this.moving = true;
                this.direction = Direction.LEFT;
            } else if (this.cursors.right.isDown) {
                this.moving = true;
                this.direction = Direction.RIGHT;
            } else if (this.cursors.up.isDown) {
                this.moving = true;
                this.direction = Direction.UP;
            } else if (this.cursors.down.isDown) {
                this.moving = true;
                this.direction = Direction.DOWN;
            }
            if (this.moving) {
                this.destination = this.position.Translate(this.direction);
                if (this.grid.HasGridTag(this.destination, GridTags.WALL)) {
                    this.moving = false;
                }
            }
            if(this.moving) {
                this.grid.BeginPlayerStep();
            }
        }
        if (!this.moving) {
            this.sprite.setPosition(this.position.x * 128 + 64, this.position.y * 128 + 64);
        }
    }
}

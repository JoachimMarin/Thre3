import * as Phaser from 'phaser';
import GridObject from './GridObject';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import { Direction } from '../Constants/Direction';
import GridPoint from '../Math/GridPoint';

export default class GreenProjectile extends GridObject {
    public image: Phaser.GameObjects.Image;

    constructor(x: integer, y: integer, grid:LevelGrid, direction:Direction, length:integer) {
        super(x, y, grid);
        var end = true;
        if(length > 1) {
            const nextPoint = this.position.Translate(direction);
            if(!this.grid.HasGridTag(nextPoint, GridTags.DESTROY_BULLETS)) {
                end = false;
                new GreenProjectile(nextPoint.x, nextPoint.y, this.grid, direction, length - 1);
            }
        }
        this.image = grid.level_scene.add.image(this.position.realX(), this.position.realY(), end ? 'green_projectile_end' : 'green_projectile');
        this.image.setDisplaySize(128, 128);
        this.image.setAngle(GridPoint.DirectionToAngle(direction));
    }

    Init() {
        this.AddGridTag(GridTags.STEP_EVENT_ALL);
    }

    Remove() {
        this.image.destroy();
        super.Remove();
    }

    StepEvent(trigger: boolean): void {
        if(!trigger) {
            this.Remove();
        }
    }
}

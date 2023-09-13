import * as Phaser from 'phaser';
import GridObjectStatic from './GridObjectStatic';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import { Direction } from '../Constants/Direction';

export default class GreenProjectile extends GridObjectStatic {
    constructor(x: integer, y: integer, grid:LevelGrid, direction:Direction, length:integer) {
        super(x, y, grid);
        if(length > 1) {
            const nextPoint = this.position.Translate(direction);
            if(!this.grid.HasGridTag(nextPoint, GridTags.DESTROY_BULLETS)) {
                new GreenProjectile(nextPoint.x, nextPoint.y, this.grid, direction, length - 1);
            }
        }
    }

    Init() {
        this.AddGridTag(GridTags.STEP_EVENT_ALL);
    }

    GetImageKey(): string {
        return 'green_projectile';
    }

    StepEvent(trigger: boolean): void {
        if(!trigger) {
            this.Remove();
        }
    }
}

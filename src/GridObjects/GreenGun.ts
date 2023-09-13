import * as Phaser from 'phaser';
import GridObjectStatic from './GridObjectStatic';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import { Direction } from '../Constants/Direction';
import {getAllEnumValues} from 'enum-for'
import GreenProjectile from './GreenProjectile';

export default class GreenGun extends GridObjectStatic {
    constructor(x: integer, y: integer, grid:LevelGrid) {
        super(x, y, grid);
    }

    Init() {
        this.AddGridTag(GridTags.WALL);
        this.AddGridTag(GridTags.STEP_EVENT_TRIGGER);
    }

    GetImageKey(): string {
        return 'green_gun';
    }

    StepEventTrigger(): void {
        this.image.setTint(0xff0000);

        for (const dir of getAllEnumValues(Direction)) {
            const nextPoint = this.position.Translate(dir);
            if(!this.grid.HasGridTag(nextPoint, GridTags.DESTROY_BULLETS)) {
                new GreenProjectile(nextPoint.x, nextPoint.y, this.grid, dir, 3);
            }
        }
       
        
        setTimeout(()=> {
            this.image.setTint();
        }, 0.5);
    }
}

import * as Phaser from 'phaser';
import GridObjectStatic from './GridObjectStatic';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';

export default class GreenGun extends GridObjectStatic {
    constructor(x: integer, y: integer, grid:LevelGrid) {
        super(x, y, grid)
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
        setTimeout(()=> {
            this.image.setTint();
        }, 0.5);
    }
}

import * as Phaser from 'phaser';
import GridObject from './GridObject';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';
import { Direction } from '../Constants/Direction';
import { getAllEnumValues } from 'enum-for'
import LaserProjectile from './LaserProjectile';
import LaserColor from '../Constants/LaserColor';

export default class LaserGun extends GridObject {
    public image: Phaser.GameObjects.Image;
    private color: LaserColor;

    constructor(x: integer, y: integer, grid: LevelGrid, color: LaserColor) {
        super(x, y, grid);
        this.color = color;

        this.image = grid.level_scene.add.image(this.position.realX(), this.position.realY(), color.name + '_gun');
        this.image.setDisplaySize(128, 128);
    }

    Init() {
        this.AddGridTag(GridTags.WALL);
        this.AddGridTag(GridTags.DESTROY_BULLETS);
        this.AddGridTag(GridTags.STEP_EVENT_TRIGGER);
    }

    Remove() {
        this.image.destroy();
        super.Remove();
    }


    OnBeginStepTrigger(): void {
        setTimeout(() => {
            for (const dir of getAllEnumValues(Direction)) {
                const nextPoint = this.position.Translate(dir);
                if (!this.grid.HasGridTag(nextPoint, GridTags.DESTROY_BULLETS)) {
                    new LaserProjectile(nextPoint.x, nextPoint.y, this.grid, dir, this.color.length, this.color);
                }
            }
        }, 250);
    }
}

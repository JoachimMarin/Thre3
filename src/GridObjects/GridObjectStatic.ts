import * as Phaser from 'phaser';
import GridObject from './GridObject';
import LevelScene from '../LevelScene';

export default abstract class GridObjectStatic extends GridObject {
    public image: Phaser.GameObjects.Image;

    constructor(x: integer, y: integer, level_scene: LevelScene) {
        super(x, y, level_scene);
        this.image = level_scene.add.image(x * 128 + 64, y * 128 + 64, this.GetImageKey());
        this.image.setDisplaySize(128, 128);
    }

    SetGridPosition(x: number, y: number): void {
        super.SetGridPosition(x, y);
        this.image.setPosition(x * 128 + 64, y * 128 + 64);
    }

    abstract GetImageKey(): string;
}
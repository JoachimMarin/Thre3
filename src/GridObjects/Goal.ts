import * as Phaser from 'phaser';
import GridObject from './GridObject';
import { GridTags } from '../Constants/GridTags';
import LevelGrid from '../LevelGrid';

export default class Goal extends GridObject {
  public image: Phaser.GameObjects.Image;

  constructor(x: integer, y: integer, grid: LevelGrid) {
    super(x, y, grid);
    this.image = grid.levelScene.add.image(
      this.position.realX(),
      this.position.realY(),
      'goal_sheet',
      Math.floor(Math.random() * 16)
    );
    this.image.setDisplaySize(128, 128);
  }

  OnInit() {
    this.AddGridTag(GridTags.DESTROY_BULLETS);
  }

  Remove() {
    this.image.destroy();
    super.Remove();
  }
}

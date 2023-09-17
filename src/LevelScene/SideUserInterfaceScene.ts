import * as Phaser from 'phaser';

export default class SideUserInterfaceScene extends Phaser.Scene {
  public readonly longSide: number = 3000;
  public readonly shortSide: number = 1000;

  private constructor() {
    super('side-user-interface');
  }

  static readonly SCENE = new SideUserInterfaceScene();

  create() {
    this.add
      .image(10000, 0, 'blue_wall')
      .setDisplaySize(this.shortSide, this.longSide);

    this.add
      .image(0, -10000, 'blue_wall')
      .setDisplaySize(this.longSide, this.shortSide);
  }
}

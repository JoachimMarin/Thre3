import * as Phaser from 'phaser';

export default class GridUserInterfaceScene extends Phaser.Scene {
  public readonly side: number = 100;

  private constructor() {
    super('grid-user-interface');
  }

  static readonly SCENE = new GridUserInterfaceScene();

  create() {}
}

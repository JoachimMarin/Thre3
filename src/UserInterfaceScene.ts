import * as Phaser from 'phaser';

export default class UserInterfaceScene extends Phaser.Scene {
  private constructor() {
    super('user-interface');
  }

  static readonly SCENE = new UserInterfaceScene();
  gridCam: Phaser.Cameras.Scene2D.Camera;

  create() {
    this.gridCam = this.cameras.add();
    this.add.image(0, 0, 'blue_wall').setDisplaySize(1000, 1000);

    this.add.image(10000, 0, 'blue_wall').setDisplaySize(1000, 1500);

    this.add.image(0, -10000, 'blue_wall').setDisplaySize(1500, 1000);
  }
}

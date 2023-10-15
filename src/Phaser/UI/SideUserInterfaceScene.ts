import * as Phaser from 'phaser';
import * as UI from 'Phaser/UI/UserInterface';

/**
 * SideUserInterfaceScene is displayed on the right or bottom of the canvas depending on the aspect ratio.
 * The SideUserInterfaceScene itself has a fixed aspect ratio of 3x10 or 10x3.
 * This is implemented using two different camera positions, centered on:
 *  (10000, 0) for landscapde mode
 *  (0, -10000) for portrait mode
 * As a result, all UI elements need to placed twice.
 */
export default class SideUserInterfaceScene extends Phaser.Scene {
  public readonly longSide: number = 100;
  public readonly shortSide: number = 30;

  private inventoryTitleL: UI.Text;

  private constructor() {
    super('side-user-interface');
  }

  static readonly SCENE = new SideUserInterfaceScene();

  landscapeX(gridX: number) {
    return 10000 - this.shortSide / 2 + gridX;
  }
  landscapeY(gridY: number) {
    return -this.longSide / 2 + gridY;
  }

  portraitX(gridX: number) {
    return -this.longSide / 2 + gridX;
  }
  portraitY(gridY: number) {
    return -10000 - this.shortSide / 2 + gridY;
  }

  preload() {
    this.load.image('ui_corner', 'assets/ui_corner.png');
    this.load.image('ui_side', 'assets/ui_side.png');
  }

  initLandscape() {
    new UI.Box(
      this,
      this.landscapeX(0),
      this.landscapeY(0),
      this.landscapeX(30),
      this.landscapeY(100),
      4
    );

    this.inventoryTitleL = new UI.Text(
      this,
      this.landscapeX(15),
      this.landscapeY(1.25),
      'Inventory:',
      4
    );
    this.inventoryTitleL.GetTextObject().setOrigin(0.5, 0);
  }

  create() {
    this.initLandscape();

    this.add
      .image(0, -10000, 'blue_wall')
      .setDisplaySize(this.longSide, this.shortSide);
  }

  update(): void {
    this.inventoryTitleL.Update();
  }
}

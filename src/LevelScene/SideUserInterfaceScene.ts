import Constants from 'Constants/Constants';
import * as Phaser from 'phaser';

export default class SideUserInterfaceScene extends Phaser.Scene {
  public readonly longSide: number = 100;
  public readonly shortSide: number = 30;
  public readonly backgroundColor: number = 0x6a8bab;

  private constructor() {
    super('side-user-interface');
  }

  static readonly SCENE = new SideUserInterfaceScene();

  setTextStyle(text: Phaser.GameObjects.Text) {
    const style = text.style;
    style.setColor('black');
    style.setFontFamily('cursive');
    style.setFontStyle('bold');
    style.setFill('white');
    style.setStroke('black', 8);
  }

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

  initBorder(minX: number, minY: number, maxX: number, maxY: number) {
    this.add
      .rectangle(minX, minY, maxX - minX, maxY - minY, this.backgroundColor)
      .setOrigin(0, 0);

    const size = 65 / 16;
    const sides: Phaser.GameObjects.Image[] = [];
    sides.push(
      this.add
        .image(minX, (minY + maxY) / 2, 'ui_side')
        .setAngle(180)
        .setDisplaySize(size, maxY - minY - 8)
    );
    sides.push(
      this.add
        .image(maxX, (minY + maxY) / 2, 'ui_side')
        .setAngle(0)
        .setDisplaySize(size, maxY - minY - 8)
    );
    sides.push(
      this.add
        .image((minX + maxX) / 2, minY, 'ui_side')
        .setAngle(270)
        .setDisplaySize(size, maxX - minX - 8)
    );
    sides.push(
      this.add
        .image((minX + maxX) / 2, maxY, 'ui_side')
        .setAngle(90)
        .setDisplaySize(size, maxX - minX - 8)
    );

    for (const side of sides) {
      side.setOrigin(1, 0.5).setTint(this.backgroundColor);
    }

    const corners: Phaser.GameObjects.Image[] = [];
    corners.push(this.add.image(minX, minY, 'ui_corner').setAngle(270));
    corners.push(this.add.image(maxX, minY, 'ui_corner').setAngle(0));
    corners.push(this.add.image(maxX, maxY, 'ui_corner').setAngle(90));
    corners.push(this.add.image(minX, maxY, 'ui_corner').setAngle(180));

    for (const corner of corners) {
      corner
        .setOrigin(1, 0)
        .setDisplaySize(size, size)
        .setTint(this.backgroundColor);
    }
  }

  initLandscape() {
    this.initBorder(
      this.landscapeX(0),
      this.landscapeY(0),
      this.landscapeX(30),
      this.landscapeY(100)
    );
    this.setTextStyle(
      this.add
        .text(this.landscapeX(15), this.landscapeY(1.25), 'Inventory:')
        .setFontSize(Constants.fontSize)
        .setScale(4 / Constants.fontSize)
        .setOrigin(0.5, 0)
    );
  }

  create() {
    this.initLandscape();

    this.add
      .image(0, -10000, 'blue_wall')
      .setDisplaySize(this.longSide, this.shortSide);
  }
}

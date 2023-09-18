import * as Phaser from 'phaser';

export class Box {
  private background: Phaser.GameObjects.Rectangle;
  private sides: Phaser.GameObjects.Image[] = [];
  private corners: Phaser.GameObjects.Image[] = [];

  update(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    borderWidth: number
  ) {
    const transparencyFix = (130 / 128) * borderWidth;

    this.background.x = minX;
    this.background.y = minY;
    this.background.width = maxX - minX;
    this.background.height = maxY - minY;

    this.sides[0]
      .setPosition(minX, (minY + maxY) / 2)
      .setDisplaySize(transparencyFix, maxY - minY);
    this.sides[1]
      .setPosition(maxX, (minY + maxY) / 2)
      .setDisplaySize(transparencyFix, maxY - minY);
    this.sides[2]
      .setPosition((minX + maxX) / 2, minY)
      .setDisplaySize(transparencyFix, maxX - minX);
    this.sides[3]
      .setPosition((minX + maxX) / 2, maxY)
      .setDisplaySize(transparencyFix, maxX - minX);

    this.corners[0].setPosition(minX, minY);
    this.corners[1].setPosition(maxX, minY);
    this.corners[2].setPosition(maxX, maxY);
    this.corners[3].setPosition(minX, maxY);

    for (const corner of this.corners) {
      corner.setDisplaySize(transparencyFix, transparencyFix);
    }
  }

  constructor(
    scene: Phaser.Scene,
    backgroundColor: number = UserInterface.BackGroundColor,
    accentColor: number = UserInterface.AccentColor,
    minX: number = 0,
    minY: number = 0,
    maxX: number = 100,
    maxY: number = 100,
    borderWidth: number = 10
  ) {
    this.background = scene.add
      .rectangle(0, 0, 1, 1, backgroundColor)
      .setOrigin(0, 0);

    this.sides.push(scene.add.image(0, 0, 'ui_side').setAngle(180));
    this.sides.push(scene.add.image(0, 0, 'ui_side').setAngle(0));
    this.sides.push(scene.add.image(0, 0, 'ui_side').setAngle(270));
    this.sides.push(scene.add.image(0, 0, 'ui_side').setAngle(90));

    for (const side of this.sides) {
      side.setOrigin(1, 0.5).setTint(accentColor).setDisplaySize(1, 1);
    }

    this.corners.push(scene.add.image(0, 0, 'ui_corner').setAngle(270));
    this.corners.push(scene.add.image(0, 0, 'ui_corner').setAngle(0));
    this.corners.push(scene.add.image(0, 0, 'ui_corner').setAngle(90));
    this.corners.push(scene.add.image(0, 0, 'ui_corner').setAngle(180));

    for (const corner of this.corners) {
      corner.setOrigin(1, 0).setTint(accentColor);
    }
    this.update(minX, minY, maxX, maxY, borderWidth);
  }
}

export default abstract class UserInterface {
  public static readonly BackGroundColor: number = 0x6a8bab;
  public static readonly AccentColor: number = 0x1a529b;

  static TextStyle(text: Phaser.GameObjects.Text) {
    const style = text.style;
    style.setColor('black');
    style.setFontFamily('cursive');
    style.setFontStyle('bold');
    style.setFill('white');
    style.setStroke('black', 8);
  }
}

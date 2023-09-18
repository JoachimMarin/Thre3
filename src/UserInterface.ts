import * as Phaser from 'phaser';

export const Const = {
  BackGroundColor: 0x6a8bab,
  AccentColor: 0x1a529b,
  MinimumFontSize: 32
};

export class Text {
  private text: Phaser.GameObjects.Text;
  private size: number;
  private style: Phaser.GameObjects.TextStyle;
  constructor(
    scene: Phaser.Scene,
    x: number = 0,
    y: number = 0,
    text: string = '',
    size: number = 16
  ) {
    this.text = scene.add.text(x, y, text);
    this.style = this.text.style;
    this.size = size;

    this.style.setColor('black');
    this.style.setFontFamily('cursive');
    this.style.setFontStyle('bold');
    this.style.setFill('white');
    this.Update();
  }

  Update() {
    const zoom = this.text.scene.cameras.main.zoom;
    const numPixels = zoom * this.size;
    const fontSize = Math.max(Const.MinimumFontSize, numPixels);
    const fontScale = this.size / fontSize;

    this.style.setFontSize(fontSize);
    this.style.setStroke('black', fontSize / 8);
    this.text.setScale(fontScale);
  }

  SetSize(size: number) {
    this.size = size;
    this.Update();
  }

  GetTextObject() {
    return this.text;
  }

  Remove() {
    this.text.off('update');
    this.text.destroy();
  }
}

export class Box {
  private backgroundBlack: Phaser.GameObjects.Rectangle;
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

    this.backgroundBlack.x = minX;
    this.backgroundBlack.y = minY;
    this.backgroundBlack.width = maxX - minX;
    this.backgroundBlack.height = maxY - minY;

    this.background.x = minX + borderWidth / 4;
    this.background.y = minY + borderWidth / 4;
    this.background.width = maxX - minX - borderWidth / 2;
    this.background.height = maxY - minY - borderWidth / 2;

    // the correct length would be max - min - 2 * borderWidth to account for borders on both sides
    // this can lead to small artifacts at the connections between the corners and the sides
    // so the sides are made longer and the parts that are too long will be hidden under the corners
    this.sides[0]
      .setPosition(minX, (minY + maxY) / 2)
      .setDisplaySize(transparencyFix, maxY - minY - borderWidth);
    this.sides[1]
      .setPosition(maxX, (minY + maxY) / 2)
      .setDisplaySize(transparencyFix, maxY - minY - borderWidth);
    this.sides[2]
      .setPosition((minX + maxX) / 2, minY)
      .setDisplaySize(transparencyFix, maxX - minX - borderWidth);
    this.sides[3]
      .setPosition((minX + maxX) / 2, maxY)
      .setDisplaySize(transparencyFix, maxX - minX - borderWidth);

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
    minX: number = 0,
    minY: number = 0,
    maxX: number = 100,
    maxY: number = 100,
    borderWidth: number = 10,
    backgroundColor: number = Const.BackGroundColor,
    accentColor: number = Const.AccentColor
  ) {
    this.backgroundBlack = scene.add.rectangle(0, 0, 1, 1, 0).setOrigin(0, 0);
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

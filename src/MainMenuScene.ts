import Constants from 'Constants/Constants';
import LevelScene from 'LevelScene/LevelScene';
import { Vec2 } from 'Math/GridPoint';
import { Box } from 'UserInterface';
import * as Phaser from 'phaser';

const numLevels = 120;

export default class MainMenuScene extends Phaser.Scene {
  public static readonly SCENE = new MainMenuScene();

  public readonly backgroundColor: number = 0x6a8bab;
  private levelSelectionBox: Box;
  private background: Phaser.GameObjects.Rectangle;
  private sides: Phaser.GameObjects.Image[] = [];
  private corners: Phaser.GameObjects.Image[] = [];
  private levelButtons: Phaser.GameObjects.Image[] = [];
  private title: Phaser.GameObjects.Text;

  private canvasSize: Vec2 = Vec2.AsVec2([0, 0]);

  private constructor() {
    super('main-menu');
  }

  setTextStyle(text: Phaser.GameObjects.Text) {
    const style = text.style;
    style.setColor('black');
    style.setFontFamily('cursive');
    style.setFontStyle('bold');
    style.setFill('white');
    style.setStroke('black', 8);
  }

  distributeButtons(
    width: number,
    height: number
  ): [number, number, number, number] {
    const numButtons = this.levelButtons.length;
    const totalArea = width * height;
    let sideLength = Math.floor(Math.sqrt(totalArea / numButtons));
    let horizontal = Math.floor(width / sideLength);
    let vertical = Math.floor(height / sideLength);
    while (horizontal * vertical < numButtons) {
      sideLength--;
      horizontal = Math.floor(width / sideLength);
      vertical = Math.floor(height / sideLength);
    }
    while ((vertical - 1) * horizontal >= numButtons) {
      vertical--;
    }
    let missingLastRow = horizontal * vertical - numButtons;
    while (missingLastRow >= vertical && vertical != 1) {
      horizontal -= 1;
      missingLastRow -= vertical;
    }
    return [sideLength, horizontal, vertical, missingLastRow];
  }

  quadraticEquation(a: number, b: number, c: number) {
    return [
      (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a),
      (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
    ];
  }

  updateBorder(minX: number, minY: number, maxX: number, maxY: number) {
    const width = maxX - minX;
    const height = maxY - minY;

    const heightFactor = 2;
    const areaFactor = 0.7;

    const a = heightFactor;
    const b = -height - width * heightFactor;
    const c = (1 - areaFactor) * (width * height);

    const horizontalMarginSelection = this.quadraticEquation(a, b, c);
    let horizontalMargin = horizontalMarginSelection[0];
    if (
      horizontalMargin < 0 ||
      (horizontalMarginSelection[1] >= 0 &&
        horizontalMarginSelection[1] < horizontalMargin)
    ) {
      horizontalMargin = horizontalMarginSelection[1];
    }
    const verticalMargin = horizontalMargin * heightFactor;

    const borderWidth = horizontalMargin / 4;

    this.levelSelectionBox.update(minX, minY, maxX, maxY, borderWidth);

    //const transparencyFix = (65 / 64) * borderWidth;

    /*this.background.x = minX;
    this.background.y = minY;
    this.background.width = maxX - minX;
    this.background.height = maxY - minY;

    this.sides[0]
      .setPosition(minX, (minY + maxY) / 2)
      .setDisplaySize(transparencyFix, maxY - minY - borderWidth * 2);
    this.sides[1]
      .setPosition(maxX, (minY + maxY) / 2)
      .setDisplaySize(transparencyFix, maxY - minY - borderWidth * 2);
    this.sides[2]
      .setPosition((minX + maxX) / 2, minY)
      .setDisplaySize(transparencyFix, maxX - minX - borderWidth * 2);
    this.sides[3]
      .setPosition((minX + maxX) / 2, maxY)
      .setDisplaySize(transparencyFix, maxX - minX - borderWidth * 2);

    this.corners[0].setPosition(minX, minY);
    this.corners[1].setPosition(maxX, minY);
    this.corners[2].setPosition(maxX, maxY);
    this.corners[3].setPosition(minX, maxY);

    for (const corner of this.corners) {
      corner.setDisplaySize(transparencyFix, transparencyFix);
    }*/

    //const mainX = borderWidth * 2;
    //const mainY = borderWidth * 2;
    const mainWidth = maxX - minX - horizontalMargin;
    const mainHeight = maxY - minY - horizontalMargin * heightFactor;

    const [sideLength, horizontal, vertical, missingLastRow] =
      this.distributeButtons(mainWidth, mainHeight);

    let offsetX =
      horizontalMargin * 0.5 + (mainWidth - horizontal * sideLength) / 2;
    const offsetY =
      verticalMargin * 0.75 + (mainHeight - vertical * sideLength) / 2;

    for (let i = 0; i < numLevels; i++) {
      const row = Math.floor(i / horizontal);
      const column = i % horizontal;
      if (row == vertical - 1 && column == 0) {
        offsetX += (sideLength * missingLastRow) / 2;
      }

      this.levelButtons[i]
        .setPosition(offsetX + column * sideLength, offsetY + row * sideLength)
        .setDisplaySize(sideLength, sideLength);
    }

    this.title.setPosition((minX + maxX) / 2, verticalMargin * 0.25);
    this.title.setScale((verticalMargin * 0.25) / Constants.fontSize);
  }

  initBorder() {
    this.levelSelectionBox = new Box(this);
    /*this.background = this.add
      .rectangle(0, 0, 1, 1, this.backgroundColor)
      .setOrigin(0, 0);

    this.sides.push(this.add.image(0, 0, 'ui_side').setAngle(180));
    this.sides.push(this.add.image(0, 0, 'ui_side').setAngle(0));
    this.sides.push(this.add.image(0, 0, 'ui_side').setAngle(270));
    this.sides.push(this.add.image(0, 0, 'ui_side').setAngle(90));

    for (const side of this.sides) {
      side.setOrigin(1, 0.5).setTint(this.backgroundColor).setDisplaySize(1, 1);
    }

    this.corners.push(this.add.image(0, 0, 'ui_corner').setAngle(270));
    this.corners.push(this.add.image(0, 0, 'ui_corner').setAngle(0));
    this.corners.push(this.add.image(0, 0, 'ui_corner').setAngle(90));
    this.corners.push(this.add.image(0, 0, 'ui_corner').setAngle(180));

    for (const corner of this.corners) {
      corner.setOrigin(1, 0).setTint(this.backgroundColor);
    }*/

    this.title = this.add
      .text(0, 0, 'Select Level:')
      .setFontSize(Constants.fontSize)
      .setOrigin(0.5, 0);
    this.setTextStyle(this.title);

    for (let i = 0; i < numLevels; i++) {
      const btn = this.add.image(0, 0, 'level_button').setOrigin(0, 0);
      btn.setTint(this.backgroundColor);
      btn.setInteractive();

      // capture constant value
      const tmp = i;
      btn.on('pointerdown', () => {
        LevelScene.index = tmp;
        this.scene.start(LevelScene.SCENE);
      });
      this.levelButtons.push(btn);
    }
  }

  init() {}

  preload() {
    this.load.image('ui_corner', 'assets/ui_corner.png');
    this.load.image('ui_side', 'assets/ui_side.png');
    this.load.image('level_button', 'assets/button1x1.png');
    this.load.image('selection_arrow', 'assets/arrow.png');
  }

  create() {
    this.initBorder();
  }

  UpdateCanvas() {
    const newCanvasSize = Vec2.AsVec2([
      this.sys.game.canvas.width,
      this.sys.game.canvas.height
    ]);

    if (newCanvasSize.Subtract(this.canvasSize).Norm() <= 0) {
      return;
    }
    this.canvasSize = newCanvasSize;
    this.updateBorder(0, 0, this.canvasSize.x, this.canvasSize.y);
  }

  update() {
    this.UpdateCanvas();
  }
}

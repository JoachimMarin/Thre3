import LevelScene from 'LevelScene/LevelScene';
import { Vec2 } from 'Math/GridPoint';
import * as UI from 'UserInterface';
import * as Phaser from 'phaser';

const maxLevels = 100;

export default class MainMenuScene extends Phaser.Scene {
  public static readonly SCENE = new MainMenuScene();

  private levelSelectionBox: UI.Box;
  private levelButtons: Phaser.GameObjects.Image[] = [];
  private levelTexts: UI.Text[] = [];
  private title: UI.Text;

  private canvasSize: Vec2 = Vec2.AsVec2([0, 0]);
  private numLevels: integer = 0;

  private constructor() {
    super('main-menu');
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

    const mainWidth = maxX - minX - horizontalMargin;
    const mainHeight = maxY - minY - horizontalMargin * heightFactor;

    const [sideLength, horizontal, vertical, missingLastRow] =
      this.distributeButtons(mainWidth, mainHeight);

    let offsetX =
      horizontalMargin * 0.5 + (mainWidth - horizontal * sideLength) / 2;
    const offsetY =
      verticalMargin * 0.75 + (mainHeight - vertical * sideLength) / 2;

    for (let i = 0; i < this.numLevels; i++) {
      const row = Math.floor(i / horizontal);
      const column = i % horizontal;
      if (row == vertical - 1 && column == 0) {
        offsetX += (sideLength * missingLastRow) / 2;
      }

      this.levelButtons[i]
        .setPosition(offsetX + column * sideLength, offsetY + row * sideLength)
        .setDisplaySize(sideLength, sideLength);
      this.levelTexts[i]
        .GetTextObject()
        .setPosition(
          offsetX + (column + 0.5) * sideLength,
          offsetY + (row + 0.5) * sideLength
        );
      this.levelTexts[i].SetSize(0.35 * sideLength);
    }

    this.title
      .GetTextObject()
      .setPosition((minX + maxX) / 2, verticalMargin * 0.25);
    this.title.SetSize(verticalMargin * 0.25);
  }

  initBorder() {
    this.levelSelectionBox = new UI.Box(this);

    this.title = new UI.Text(this, 0, 0, 'Select Level:');
    this.title.GetTextObject().setOrigin(0.5, 0);

    for (let i = 0; i < this.numLevels; i++) {
      const btn = this.add.image(0, 0, 'level_button').setOrigin(0, 0);
      btn.setTint(UI.Const.AccentColor);
      btn.setInteractive();

      // capture constant value
      const tmp = i;
      btn.on('pointerdown', () => {
        LevelScene.index = tmp;
        this.scene.start(LevelScene.SCENE);
      });
      this.levelButtons.push(btn);

      const text = new UI.Text(this, 0, 0, '' + i);
      text.GetTextObject().setOrigin(0.5, 0.5);
      this.levelTexts.push(text);
    }
  }

  init() {}

  preload() {
    this.load.image('ui_corner', 'assets/ui_corner.png');
    this.load.image('ui_side', 'assets/ui_side.png');
    this.load.image('level_button', 'assets/button1x1.png');
    this.load.image('selection_arrow', 'assets/arrow.png');

    for (let i = 0; i < maxLevels; i++) {
      this.load.xml('level_file_' + i, 'assets/levels/level' + i + '.tmx');
    }
  }

  create() {
    for (let i = 0; i < maxLevels; i++) {
      if (!this.cache.xml.has('level_file_' + i)) {
        this.numLevels = i;
        break;
      }
    }
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

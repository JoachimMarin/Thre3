import GameManager from 'Game/GameManager';
import * as UI from 'Phaser/UI/UserInterface';
import * as Phaser from 'phaser';

// arrows:
// ⭡⭢⭣⭠
//

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

  private stepsCurrentValueL: UI.Text;
  private stepsTotalValueL: UI.Text;
  private stepsCurrentValueP: UI.Text;
  private stepsTotalValueP: UI.Text;
  private updateTexts: UI.Text[];

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
    this.load.image('ui_restart', 'assets/ui_restart.png');
    this.load.image('ui_escape', 'assets/ui_escape.png');
  }

  private addTextL(
    x: number = 0,
    y: number = 0,
    str: string = '',
    size: number = 16
  ) {
    const text = new UI.Text(
      this,
      this.landscapeX(x),
      this.landscapeY(y),
      str,
      size
    );
    this.updateTexts.push(text);
    return text;
  }
  private addTextP(
    x: number = 0,
    y: number = 0,
    str: string = '',
    size: number = 16
  ) {
    const text = new UI.Text(
      this,
      this.portraitX(x),
      this.portraitY(y),
      str,
      size
    );
    this.updateTexts.push(text);
    return text;
  }

  initLandscape() {
    new UI.Box(
      this,
      this.landscapeX(0),
      this.landscapeY(0),
      this.landscapeX(30),
      this.landscapeY(30),
      3
    );

    new UI.Box(
      this,
      this.landscapeX(0),
      this.landscapeY(30),
      this.landscapeX(30),
      this.landscapeY(90),
      3
    );

    const restartBox = new UI.Box(
      this,
      this.landscapeX(0),
      this.landscapeY(90),
      this.landscapeX(15),
      this.landscapeY(100),
      3,
      UI.Const.BackGroundRed,
      UI.Const.AccentRed
    );
    const escapeBox = new UI.Box(
      this,
      this.landscapeX(15),
      this.landscapeY(90),
      this.landscapeX(30),
      this.landscapeY(100),
      3,
      UI.Const.BackGroundRed,
      UI.Const.AccentRed
    );

    this.addTextL(2.5, 1.5, 'Steps:', 4).GetTextObject().setOrigin(0, 0);

    this.stepsCurrentValueL = this.addTextL(27.5, 1.5, '0/3', 4);
    this.stepsCurrentValueL.GetTextObject().setOrigin(1, 0);

    this.addTextL(2.5, 6, 'Total:', 4).GetTextObject().setOrigin(0, 0);
    this.stepsTotalValueL = this.addTextL(27.5, 6, '0', 4);
    this.stepsTotalValueL.GetTextObject().setOrigin(1, 0);

    this.addTextL(2.5, 28.5, '⭣  Items:  ⭣', 4).GetTextObject().setOrigin(0, 1);

    const restart = this.add.image(
      this.landscapeX(7.5),
      this.landscapeY(95),
      'ui_restart'
    );
    restart.setDisplaySize(5, 5).setTint(UI.Const.AccentRed);
    restartBox.BoundingBox.setInteractive().on('pointerdown', () => {
      GameManager.RestartLevel();
    });

    const escape = this.add.image(
      this.landscapeX(22.5),
      this.landscapeY(95),
      'ui_escape'
    );
    escape.setDisplaySize(5, 5).setTint(UI.Const.AccentRed);
    escapeBox.BoundingBox.setInteractive().on('pointerdown', () => {
      this.scene.stop('grid-user-interface');
      this.scene.stop('level');
      this.scene.stop('side-user-interface');
      this.scene.run('main-menu');
    });
  }

  initPortrait() {
    new UI.Box(
      this,
      this.portraitX(0),
      this.portraitY(0),
      this.portraitX(30),
      this.portraitY(30),
      3
    );

    new UI.Box(
      this,
      this.portraitX(30),
      this.portraitY(0),
      this.portraitX(90),
      this.portraitY(30),
      3
    );

    const restartBox = new UI.Box(
      this,
      this.portraitX(90),
      this.portraitY(0),
      this.portraitX(100),
      this.portraitY(15),
      3,
      UI.Const.BackGroundRed,
      UI.Const.AccentRed
    );
    const escapeBox = new UI.Box(
      this,
      this.portraitX(90),
      this.portraitY(15),
      this.portraitX(100),
      this.portraitY(30),
      3,
      UI.Const.BackGroundRed,
      UI.Const.AccentRed
    );

    this.addTextP(2.5, 1.5, 'Steps:', 4).GetTextObject().setOrigin(0, 0);

    this.stepsCurrentValueP = this.addTextP(27.5, 1.5, '0/3', 4);
    this.stepsCurrentValueP.GetTextObject().setOrigin(1, 0);

    this.addTextP(2.5, 6, 'Total:', 4).GetTextObject().setOrigin(0, 0);
    this.stepsTotalValueP = this.addTextP(27.5, 6, '0', 4);
    this.stepsTotalValueP.GetTextObject().setOrigin(1, 0);

    this.addTextP(2.5, 28.5, 'Items:    ⭢', 4).GetTextObject().setOrigin(0, 1);

    const restart = this.add.image(
      this.portraitX(95),
      this.portraitY(7.5),
      'ui_restart'
    );
    restart.setDisplaySize(5, 5).setTint(UI.Const.AccentRed);
    restartBox.BoundingBox.setInteractive().on('pointerdown', () => {
      GameManager.RestartLevel();
    });

    const escape = this.add.image(
      this.portraitX(95),
      this.portraitY(22.5),
      'ui_escape'
    );
    escape.setDisplaySize(5, 5).setTint(UI.Const.AccentRed);
    escapeBox.BoundingBox.setInteractive().on('pointerdown', () => {
      this.scene.stop('grid-user-interface');
      this.scene.stop('level');
      this.scene.stop('side-user-interface');
      this.scene.run('main-menu');
    });
  }

  create() {
    this.updateTexts = [];
    this.initLandscape();
    this.initPortrait();
  }

  update(): void {
    if (GameManager.levelState !== undefined) {
      const current =
        GameManager.levelState.dynamicState.currentStep.toString() +
        '/' +
        GameManager.levelState.dynamicState.maxStep.toString();
      const total = GameManager.levelState.dynamicState.totalStep.toString();
      this.stepsCurrentValueL.GetTextObject().setText(current);
      this.stepsCurrentValueP.GetTextObject().setText(current);
      this.stepsTotalValueL.GetTextObject().setText(total);
      this.stepsTotalValueP.GetTextObject().setText(total);
      for (const text of this.updateTexts) {
        text.Update();
      }
    }
  }
}

import * as Phaser from 'phaser';
import LevelScene from 'LevelScene';

const numLevels = 10;

export default class MainMenuScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private buttons: Phaser.GameObjects.Image[] = [];
  private selectedButtonIndex = 0;
  private buttonSelector!: Phaser.GameObjects.Image;

  static GetLevels() {
    const levels = [];
    for (let i = 0; i < numLevels; i++) {
      levels.push(new LevelScene(i));
    }
    return levels;
  }

  constructor() {
    super('main-menu');
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.load.image('level_button', 'assets/button2x1.png');
    this.load.image('selection_arrow', 'assets/arrow.png');
  }

  create() {
    for (let i = 0; i < numLevels; i++) {
      const btn = this.add.image(192 + 512, 384 + 224 * i, 'level_button');
      btn.setDisplaySize(384, 192);
      this.add
        .text(btn.x, btn.y, (i + 1).toString())
        .setFont('Verdana')
        .setFontSize(160)
        .setColor('black')
        .setOrigin(0.5);
      this.buttons.push(btn);
      const tmp = i;
      btn.on('selected', () => {
        console.log(tmp.toString());
        this.scene.start('level-' + tmp.toString());
      });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        btn.off('selected');
      });
    }

    this.buttonSelector = this.add
      .image(0, 0, 'selection_arrow')
      .setDisplaySize(128, 128);

    this.selectButton(0);
  }
  selectButton(index: number) {
    const currentButton = this.buttons[this.selectedButtonIndex];

    // set the current selected button to a white tint
    currentButton.setTint(0xffffff);

    const button = this.buttons[index];

    // set the newly selected button to a green tint
    button.setTint(0x66ff7f);

    // move the hand cursor to the right edge
    this.buttonSelector.x = button.x + button.displayWidth * 0.5;
    this.buttonSelector.y = button.y;

    // store the new selected index
    this.selectedButtonIndex = index;
  }

  selectNextButton(change = 1) {
    let index = this.selectedButtonIndex + change;

    // wrap the index to the front or end of array
    if (index >= this.buttons.length) {
      index = 0;
    } else if (index < 0) {
      index = this.buttons.length - 1;
    }

    this.selectButton(index);
  }

  confirmSelection() {
    // get the currently selected button
    const button = this.buttons[this.selectedButtonIndex];

    // emit the 'selected' event
    button.emit('selected');
  }

  update() {
    const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up!);
    const downJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down!);
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
      this.cursors.space!
    );

    if (upJustPressed) {
      this.selectNextButton(-1);
    } else if (downJustPressed) {
      this.selectNextButton(1);
    } else if (spaceJustPressed) {
      this.confirmSelection();
    }
  }
}

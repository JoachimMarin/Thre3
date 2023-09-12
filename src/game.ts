import * as Phaser from 'phaser';

import Demo from './DemoScene';
import MainMenuScene from './MainMenuScene';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#eeeeee',
    width: 3840,
    height: 2560,
    scene: MainMenuScene,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameDiv'
    }
};

const game = new Phaser.Game(config);

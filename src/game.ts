import * as Phaser from 'phaser';

import MainMenuScene from './MainMenuScene';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#777777',
    width: 3840,
    height: 2560,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [MainMenuScene].concat(MainMenuScene.GetLevels()),
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameDiv',
        autoCenter: Phaser.Scale.CENTER_BOTH,

    }
};

const game = new Phaser.Game(config);

import * as Phaser from 'phaser';

import Scenes from 'Scenes';

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
  scene: Scenes.ALL,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'gameDiv',
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);

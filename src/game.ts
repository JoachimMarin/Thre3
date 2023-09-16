import * as Phaser from 'phaser';

import Scenes from 'Scenes';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#777777',
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: Scenes.ALL,
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'gameDiv',
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);

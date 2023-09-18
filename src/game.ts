import * as Phaser from 'phaser';

import Scenes from 'Scenes';

const config = {
  type: Phaser.AUTO,
  antialias: true,
  backgroundColor: '#000000',
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
  },
  renderer: { mipmapFilter: 'LINEAR_MIPMAP_LINEAR' }
};

new Phaser.Game(config);

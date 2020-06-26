import 'phaser';

import { BootScene } from 'src/scenes/boot.scene';
import { CrateboxScene } from 'cratebox/cratebox.scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  backgroundColor: '#ADD8E6',
  parent: 'game',
  width: 400,
  height: 240,
  zoom: 2,
  render: {
    antialias: false,
    pixelArt: true
  },
  input: {
    gamepad: false
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: true
    }
  },
  scene: [
    BootScene,
    CrateboxScene
  ]
};

const game = new Phaser.Game(config);
console.log(game);

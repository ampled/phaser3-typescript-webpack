import 'phaser';

import { BootScene } from 'scenes/boot.scene';
import { CrateboxScene } from 'cratebox/cratebox.scene';

const config: Opt<GameConfig> = {
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
    gamepad: true
  },
  // fps: {
  //   min: 1,
  //   target: 30,
  //   forceSetTimeOut: true,
  //   panicMax: 20
  // },
  physics: {
    default: 'arcade',
    arcade: {
      tilebias: 0,
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

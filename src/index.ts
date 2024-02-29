import 'phaser';

import './index.css';

import { BootScene } from 'scenes/boot.scene';
import { CrateboxScene } from 'cratebox/cratebox.scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  backgroundColor: '#ADD8E6',
  parent: 'game',
  width: 800,
  height: 480,
  zoom: 1,
  pixelArt: true,
  // antialias: true,
  // render: {
  //   antialias: false,
  //   pixelArt: true,
  // },
  input: {
    gamepad: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 480,
    },
    max: {
      width: 800 * 2,
      height: 480 * 2,
    },
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
      // tileBias: 0,
      gravity: { y: 600, x: 0 },
      debug: true,
    },
  },
  scene: [
    BootScene,
    // BigMapScene,
    // TileMapScene,
    CrateboxScene,
  ],
};

const game = new Phaser.Game(config);
// console.log(game);

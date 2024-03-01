import 'phaser';

import './index.css';

import { BootScene } from 'scenes/boot.scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  backgroundColor: '#ADD8E6',
  parent: 'game',
  width: 800,
  height: 480,
  zoom: 1,
  pixelArt: true,
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
  scene: [BootScene],
};

new Phaser.Game(config);

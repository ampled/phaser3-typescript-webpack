import 'phaser';

import { Game } from 'phaser-util/game';
import { BootScene } from 'scenes/boot.scene';
import { CrateboxScene } from 'cratebox/cratebox.scene';

const config: Opt<GameConfig> = {
  type: Phaser.WEBGL,
  backgroundColor: '#ADD8E6',
  parent: 'game',
  width: 400,
  height: 240,
  zoom: 2,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      tilebias: 4,
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

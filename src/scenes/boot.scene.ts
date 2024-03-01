import phaserLogo from '../assets/phaser-planet-web.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.image('phaser-logo', phaserLogo);
  }

  create() {
    this.add.tween({
      targets: this.add.image(400, 240, 'phaser-logo'),
      scaleX: 2,
      scaleY: 2,
      yoyo: true,
      repeat: -1,
      duration: 2000,
      ease: Phaser.Math.Easing.Sine.InOut,
    });
  }
}

import { Scene } from 'phaser-util/scene';

import * as crateboxMap from 'assets/tilemaps/cratebox.json';
import * as crateboxTiles from 'assets/tilesets/16x16.png';

import * as playerSprite from 'assets/sprites/player.png';
import * as playerSpriteSheet from 'assets/sprites/player/player.png';
import * as playerSpriteAtlas from 'assets/sprites/player/player.json';
import * as enemySprite from 'assets/sprites/enemy.png';
import * as starSprite from 'assets/sprites/star.png';

import * as gunSprite from 'assets/sprites/gun.png';
import * as minigunSprite from 'assets/sprites/minigun.png';
import * as dualGunSprite from 'assets/sprites/dualgun.png';
import * as projectileSprite from 'assets/sprites/projectile.png';
import * as smgSprite from 'assets/sprites/smg.png';
import * as smgProj from 'assets/sprites/smgproj.png';
import * as shotgunSprite from 'assets/sprites/shotgun.png';
import * as shotgunProj from 'assets/sprites/shotgunproj.png';

import * as dirButton from 'assets/sprites/touch/dir.png';
import * as shootButton from 'assets/sprites/touch/shoot.png';

import * as marioFontPng from 'assets/fonts/font.png';
import * as marioFont from 'assets/fonts/font.fnt';

import * as bgm1mp3 from 'assets/music/bgm1.mp3';
import * as bgm1ogg from 'assets/music/bgm1.ogg';

import * as sfxmp3 from 'assets/sounds/sfx.mp3';
import * as sfxogg from 'assets/sounds/sfx.ogg';
import * as sfxsheet from 'assets/sounds/sfx.json';

export class BootScene extends Scene {
  text: ArcadePhysicsText;
  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    this.load
      .tilemapTiledJSON('cratebox', crateboxMap)
      .spritesheet('cratebox', crateboxTiles, { frameWidth: 64, frameHeight: 64 })
      .spritesheet('player', playerSprite, { frameWidth: 16, frameHeight: 16 })
      .atlas('player-sprites', playerSpriteSheet, playerSpriteAtlas)
      .spritesheet('enemy', enemySprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('star', starSprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('projectile', projectileSprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('smgproj', smgProj, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('shotgunproj', shotgunProj, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('dualgun', dualGunSprite, { frameWidth: 48, frameHeight: 16 })
      .spritesheet('gun', gunSprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('minigun', minigunSprite, { frameWidth: 17, frameHeight: 17 })
      .spritesheet('smg', smgSprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('dir', dirButton, { frameWidth: 60, frameHeight: 60 })
      .spritesheet('shoot', shootButton, { frameWidth: 60, frameHeight: 60 })
      .spritesheet('shotgun', shotgunSprite, { frameWidth: 16, frameHeight: 16 })
      .bitmapFont('mario', marioFontPng, marioFont)
      .audio('bgm', [
        bgm1mp3,
        bgm1ogg
      ])
      .audioSprite('sfx', [
        sfxmp3,
        sfxogg
      ], sfxsheet as any, { instances: 2 });

  }

  create() {
    const stand: AnimationConfig = {
      key: 'stand',
      defaultTexturekey: 'player',
      frames: this.anims.generateFrameNames('player-sprites',
        { start: 2, end: 2, first: 2, suffix: '.png', zeroPad: 2 })
    } as any;
    const walk: AnimationConfig = {
      key: 'walk',
      defaultTextureKey: 'player',
      frameRate: 15,
      repeat: -1,
      repeatDelay: 0,
      yoyo: false,
      frames: [
        { key: 'player-sprites', frame: '01.png' },
        { key: 'player-sprites', frame: '03.png' }
      ]
      // this.anims.generateFrameNames('player-sprites',
      //   { start: 1, end: 3, first: 1, suffix: '.png', zeroPad: 2 })
    } as any;

    const run: AnimationConfig = {
      key: 'run',
      defaultTextureKey: 'player',
      frameRate: 15,
      repeat: -1,
      repeatDelay: 0,
      yoyo: true,
      frames: [
        { key: 'player-sprites', frame: '09.png' },
        { key: 'player-sprites', frame: '010.png' },
        { key: 'player-sprites', frame: '011.png' }
      ]
      // this.anims.generateFrameNames('player-sprites',
      //   { start: 1, end: 3, first: 1, suffix: '.png', zeroPad: 2 })
    } as any;

    const jump: AnimationConfig = {
      key: 'jump',
      repeat: -1,
      defaultTextureKey: 'player',
      repeatDelay: 0,
      frameRate: 15,
      frames: this.anims.generateFrameNames('player-sprites',
        { start: 4, end: 7, first: 4, suffix: '.png', zeroPad: 2 })
    } as any;

    const shoot: AnimationConfig = {
      key: 'shoot',
      duration: 5,
      defaultTextureKey: 'player',
      frames: this.anims.generateFrameNames('player-sprites',
        { start: 8, end: 8, first: 8, suffix: '.png', zeroPad: 2 })
    } as any;

    this.anims.create(stand);
    this.anims.create(walk);
    this.anims.create(run);
    this.anims.create(jump);
    this.anims.create(shoot);

    this.text = this.add.text(0, 0, 'TEST', { font: '28px Tahoma' }) as any;
    this.physics.world.enable(this.text);
    this.text.body.collideWorldBounds = true;
    this.text.body.setVelocityX(50).setBounce(1, 1);

    this.keys = {
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO)
    };

    this.input.keyboard.on('keyup', e => {
      if (e.key === '2') {
        // this.scene.start('CrateboxScene');
      }
    });

    // this.scene.pause('Boot');
    this.scene.start('CrateboxScene');
  }

  update(time: number, delta: number) {
    // if (this.text.body.onFloor()) console.log('floor');
    // if (this.text.body.onWall()) console.log('wall');
  }

}

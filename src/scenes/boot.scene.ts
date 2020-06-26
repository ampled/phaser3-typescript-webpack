import crateboxMap2 from 'src/assets/tilemaps/cratebox2.json';
import crateboxMap from 'src/assets/tilemaps/cratebox.json';
import crateboxTiles from 'src/assets/tilesets/16x16.png';

import playerSprite from 'src/assets/sprites/player.png';
import playerSpriteSheet from 'src/assets/sprites/player/player.png';
import playerSpriteAtlas from 'src/assets/sprites/player/player.json';

import enemySpriteSheet from 'src/assets/sprites/enemies/enemies.png';
import enemySpriteAtlas from 'src/assets/sprites/enemies/enemies.json';
import benemySpriteSheet from 'src/assets/sprites/enemies/bigenemies.png';
import benemySpriteAtlas from 'src/assets/sprites/enemies/bigenemies.json';

import gunSpriteSheet from 'src/assets/sprites/guns/guns.png';
import gunSpriteAtlas from 'src/assets/sprites/guns/guns.json';

import projSpriteSheet from 'src/assets/sprites/guns/projectiles.png';
import projSpriteAtlas from 'src/assets/sprites/guns/projectiles.json';

import enemySprite from 'src/assets/sprites/enemy.png';
import starSprite from 'src/assets/sprites/star.png';

import minigunSprite from 'src/assets/sprites/minigun.png';
import dualGunSprite from 'src/assets/sprites/dualgun.png';
import gunSprite from 'src/assets/sprites/gun.png';
import projectileSprite from 'src/assets/sprites/projectile.png';
import smgSprite from 'src/assets/sprites/smg.png';
import smgProj from 'src/assets/sprites/smgproj.png';
import shotgunSprite from 'src/assets/sprites/shotgun.png';
import shotgunProj from 'src/assets/sprites/shotgunproj.png';

import dirButton from 'src/assets/sprites/touch/dir.png';
import shootButton from 'src/assets/sprites/touch/shoot.png';

import marioFontPng from 'src/assets/fonts/font.png';
import marioFont from 'src/assets/fonts/font.fnt';

import bgm1mp3 from 'src/assets/music/bgm1.mp3';
import bgm1ogg from 'src/assets/music/bgm1.ogg';

import sfxmp3 from 'src/assets/sounds/sfx.mp3';
import sfxogg from 'src/assets/sounds/sfx.ogg';
import sfxsheet from 'src/assets/sounds/sfx.json';

export class BootScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    this.load
      .tilemapTiledJSON('cratebox2', crateboxMap2)
      .tilemapTiledJSON('cratebox', crateboxMap)
      .spritesheet('cratebox', crateboxTiles, { frameWidth: 64, frameHeight: 64 })
      .spritesheet('player', playerSprite, { frameWidth: 16, frameHeight: 16 })
      .atlas('player-sprites', playerSpriteSheet, playerSpriteAtlas)
      .atlas('enemies', enemySpriteSheet, enemySpriteAtlas)
      .atlas('benemies', benemySpriteSheet, benemySpriteAtlas)
      .atlas('guns', gunSpriteSheet, gunSpriteAtlas)
      .atlas('projectiles', projSpriteSheet, projSpriteAtlas)
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
      .audioSprite('sfx', sfxsheet, [sfxmp3, sfxogg]);

  }

  create() {
    const explosionGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    explosionGraphic.fillStyle(Phaser.Display.Color.GetColor(255, 255, 255), 1);
    explosionGraphic.fillCircle(10, 10, 10);
    explosionGraphic.generateTexture('explosion', 20, 20);

    // PLAYER ANIMS
    const stand: Phaser.Types.Animations.Animation = {
      key: 'stand',
      defaultTextureKey: 'player',
      frames: this.anims.generateFrameNames('player-sprites',
        { start: 2, end: 2, suffix: '.png', zeroPad: 2 })
    };

    const walk: Phaser.Types.Animations.Animation = {
      key: 'walk',
      defaultTextureKey: 'player',
      frameRate: 15,
      repeat: -1,
      yoyo: false,
      frames: [
        { key: 'player-sprites', frame: '01.png' },
        { key: 'player-sprites', frame: '03.png' }
      ]
    };

    const run: Phaser.Types.Animations.Animation = {
      key: 'run',
      defaultTextureKey: 'player-sprites',
      frameRate: 12,
      repeat: -1,
      yoyo: true,
      frames: [
        { key: 'player-sprites', frame: '09.png' },
        { key: 'player-sprites', frame: '010.png' },
        { key: 'player-sprites', frame: '011.png' },
        { key: 'player-sprites', frame: '010.png' },
      ]
    };

    const jump: Phaser.Types.Animations.Animation = {
      key: 'jump',
      repeat: -1,
      defaultTextureKey: 'player',
      repeatDelay: 0,
      frameRate: 15,
      frames: this.anims.generateFrameNames('player-sprites',
        { start: 4, end: 7, suffix: '.png', zeroPad: 2 })
    };

    const shoot: Phaser.Types.Animations.Animation = {
      key: 'shoot',
      duration: 5,
      defaultTextureKey: 'player',
      frames: this.anims.generateFrameNames('player-sprites',
        { start: 8, end: 8, suffix: '.png', zeroPad: 2 })
    };

    this.anims.create(stand);
    this.anims.create(walk);
    this.anims.create(run);
    this.anims.create(jump);
    this.anims.create(shoot);

    // ENEMY ANIMS
    this.anims.create({
      key: 'drone',
      frameRate: 10,
      repeat: -1,
      frames: this.anims.generateFrameNames('enemies', { start: 1, end: 2, zeroPad: 2, prefix: 'drone' })
    });

    this.anims.create({
      key: 'dronemad',
      frameRate: 20,
      repeat: -1,
      frames: this.anims.generateFrameNames('enemies', { start: 1, end: 2, zeroPad: 2, prefix: 'dronemad' })
    });

    this.anims.create({
      key: 'bigwalkmad',
      frameRate: 20,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNames('benemies', { start: 0, end: 2, zeroPad: 2, prefix: 'bigmad' })
    });

    this.anims.create({
      key: 'bigwalk',
      frameRate: 15,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNames('benemies', { start: 0, end: 2, zeroPad: 2, prefix: 'big' })
    });

    this.anims.create({
      key: 'enemywalk',
      frameRate: 15,
      repeat: -1,
      frames: this.anims.generateFrameNames('enemies', { start: 0, end: 1, zeroPad: 2 })
    });
    this.anims.create({
      key: 'enemywalkmad',
      frameRate: 20,
      repeat: -1,
      frames: this.anims.generateFrameNames('enemies', { start: 0, end: 1, zeroPad: 2, prefix: 'mad' })
    });

    // WEAPON ANIMS
    this.anims.create({
      key: 'fpattack',
      frameRate: 15,
      frames: [
        { key: 'guns', frame: 'fryingpanattack' },
        { key: 'guns', frame: 'fryingpan' }]
    });

    // PROJECTILE ANIMS
    this.anims.create({
      key: 'projectile',
      frames: [
        { key: 'projectiles', frame: 'projectile' },
        { key: 'projectiles', frame: 'smgproj' }
      ]
    });

    this.anims.create({
      key: 'projectilefast',
      duration: 100,
      frameRate: 32,
      frames: [
        { key: 'projectiles', frame: 'projectile' },
        { key: 'projectiles', frame: 'smgproj' }
      ]
    });

    this.anims.create({
      key: 'disc',
      repeat: -1,
      frameRate: 24,
      frames: [
        { key: 'projectiles', frame: 'disc00' },
        { key: 'projectiles', frame: 'disc01' }
      ]
    });

    this.anims.create({
      key: 'fire',
      repeat: -1,
      frames: [
        { key: 'projectiles', frame: 'fire00' },
        { key: 'projectiles', frame: 'fire01' },
        { key: 'projectiles', frame: 'fire02' }
      ]
    });

    this.scene.start('CrateboxScene');
  }

}

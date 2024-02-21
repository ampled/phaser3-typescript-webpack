import crateboxMap from 'assets/tilemaps/cratebox.json';
import crateboxTiles from 'assets/tilesets/16x16.png';

import playerSprite from 'assets/sprites/player.png';
import playerSpriteSheet from 'assets/sprites/player/player.png';
import playerSpriteAtlas from 'assets/sprites/player/player.json';

import enemySpriteSheet from 'assets/sprites/enemies/enemies.png';
import enemySpriteAtlas from 'assets/sprites/enemies/enemies.json';
import benemySpriteSheet from 'assets/sprites/enemies/bigenemies.png';
import benemySpriteAtlas from 'assets/sprites/enemies/bigenemies.json';

import gunSpriteSheet from 'assets/sprites/guns/guns.png';
import gunSpriteAtlas from 'assets/sprites/guns/guns.json';

import projSpriteSheet from 'assets/sprites/guns/projectiles.png';
import projSpriteAtlas from 'assets/sprites/guns/projectiles.json';

import enemySprite from 'assets/sprites/enemy.png';
import starSprite from 'assets/sprites/star.png';

import gunSprite from 'assets/sprites/gun.png';
import minigunSprite from 'assets/sprites/minigun.png';
import dualGunSprite from 'assets/sprites/dualgun.png';
import projectileSprite from 'assets/sprites/projectile.png';
import smgSprite from 'assets/sprites/smg.png';
import smgProj from 'assets/sprites/smgproj.png';
import shotgunSprite from 'assets/sprites/shotgun.png';
import shotgunProj from 'assets/sprites/shotgunproj.png';

import dirButton from 'assets/sprites/touch/dir.png';
import shootButton from 'assets/sprites/touch/shoot.png';

import marioFontPng from 'assets/fonts/font.png';
import marioFont from 'assets/fonts/font.fnt';

import bgm1mp3 from 'assets/music/bgm1.mp3';
import bgm1ogg from 'assets/music/bgm1.ogg';

import sfxmp3 from 'assets/sounds/sfx.mp3';
import sfxogg from 'assets/sounds/sfx.ogg';
import sfxsheet from 'assets/sounds/sfx.json';

export class BootScene extends Phaser.Scene {
  text: ArcadePhysicsText;
  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    this.load
      .tilemapTiledJSON('cratebox', crateboxMap)
      .spritesheet('cratebox', crateboxTiles, {
        frameWidth: 64,
        frameHeight: 64,
      })
      .spritesheet('player', playerSprite, { frameWidth: 16, frameHeight: 16 })
      .atlas('player-sprites', playerSpriteSheet, playerSpriteAtlas)
      .atlas('enemies', enemySpriteSheet, enemySpriteAtlas)
      .atlas('benemies', benemySpriteSheet, benemySpriteAtlas)
      .atlas('guns', gunSpriteSheet, gunSpriteAtlas)
      .atlas('projectiles', projSpriteSheet, projSpriteAtlas)
      .spritesheet('enemy', enemySprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('star', starSprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('projectile', projectileSprite, {
        frameWidth: 16,
        frameHeight: 16,
      })
      .spritesheet('smgproj', smgProj, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('shotgunproj', shotgunProj, {
        frameWidth: 16,
        frameHeight: 16,
      })
      .spritesheet('dualgun', dualGunSprite, {
        frameWidth: 48,
        frameHeight: 16,
      })
      .spritesheet('gun', gunSprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('minigun', minigunSprite, {
        frameWidth: 17,
        frameHeight: 17,
      })
      .spritesheet('smg', smgSprite, { frameWidth: 16, frameHeight: 16 })
      .spritesheet('dir', dirButton, { frameWidth: 60, frameHeight: 60 })
      .spritesheet('shoot', shootButton, { frameWidth: 60, frameHeight: 60 })
      .spritesheet('shotgun', shotgunSprite, {
        frameWidth: 16,
        frameHeight: 16,
      })
      .bitmapFont('mario', marioFontPng, marioFont)
      .audio('bgm', [bgm1mp3, bgm1ogg])
      .audioSprite('sfx', sfxsheet, [sfxmp3, sfxogg]);
  }

  create() {
    const explosionGraphic = this.make.graphics({ x: 0, y: 0 }, false);
    explosionGraphic.fillStyle(Phaser.Display.Color.GetColor(255, 255, 255), 1);
    explosionGraphic.fillCircle(10, 10, 10);
    explosionGraphic.generateTexture('explosion', 20, 20);

    // PLAYER ANIMS
    const stand: Phaser.Types.Animations.Animation = {
      key: 'stand',
      defaultTextureKey: 'player',
      frames: this.anims.generateFrameNames('player-sprites', {
        start: 2,
        end: 2,
        suffix: '.png',
        zeroPad: 2,
      }),
    };

    const walk: Phaser.Types.Animations.Animation = {
      key: 'walk',
      defaultTextureKey: 'player',
      frameRate: 15,
      repeat: -1,
      repeatDelay: 0,
      yoyo: false,
      frames: [
        { key: 'player-sprites', frame: '01.png' },
        { key: 'player-sprites', frame: '03.png' },
      ],
    };

    const run: Phaser.Types.Animations.Animation = {
      key: 'run',
      defaultTextureKey: 'player',
      frameRate: 15,
      repeat: -1,
      yoyo: true,
      frames: [
        { key: 'player-sprites', frame: '09.png' },
        { key: 'player-sprites', frame: '010.png' },
        { key: 'player-sprites', frame: '011.png' },
        { key: 'player-sprites', frame: '010.png' },
      ],
    };

    const jump: Phaser.Types.Animations.Animation = {
      key: 'jump',
      repeat: -1,
      defaultTextureKey: 'player',
      repeatDelay: 0,
      frameRate: 15,
      frames: this.anims.generateFrameNames('player-sprites', {
        start: 4,
        end: 7,
        suffix: '.png',
        zeroPad: 2,
      }),
    };

    const shoot: Phaser.Types.Animations.Animation = {
      key: 'shoot',
      duration: 5,
      defaultTextureKey: 'player',
      frames: this.anims.generateFrameNames('player-sprites', {
        start: 8,
        end: 8,
        suffix: '.png',
        zeroPad: 2,
      }),
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
      frames: this.anims.generateFrameNames('enemies', {
        start: 1,
        end: 2,
        zeroPad: 2,
        prefix: 'drone',
      }),
    });

    this.anims.create({
      key: 'dronemad',
      frameRate: 20,
      repeat: -1,
      frames: this.anims.generateFrameNames('enemies', {
        start: 1,
        end: 2,
        zeroPad: 2,
        prefix: 'dronemad',
      }),
    });

    this.anims.create({
      key: 'bigwalkmad',
      frameRate: 20,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNames('benemies', {
        start: 0,
        end: 2,
        zeroPad: 2,
        prefix: 'bigmad',
      }),
    });

    this.anims.create({
      key: 'bigwalk',
      frameRate: 15,
      repeat: -1,
      yoyo: true,
      frames: this.anims.generateFrameNames('benemies', {
        start: 0,
        end: 2,
        zeroPad: 2,
        prefix: 'big',
      }),
    });

    this.anims.create({
      key: 'enemywalk',
      frameRate: 15,
      repeat: -1,
      frames: this.anims.generateFrameNames('enemies', {
        start: 0,
        end: 1,
        zeroPad: 2,
      }),
    });
    this.anims.create({
      key: 'enemywalkmad',
      frameRate: 20,
      repeat: -1,
      frames: this.anims.generateFrameNames('enemies', {
        start: 0,
        end: 1,
        zeroPad: 2,
        prefix: 'mad',
      }),
    });

    // WEAPON ANIMS
    this.anims.create({
      key: 'fpattack',
      frameRate: 15,
      frames: [
        { key: 'guns', frame: 'fryingpanattack' },
        { key: 'guns', frame: 'fryingpan' },
      ],
    });

    // PROJECTILE ANIMS
    this.anims.create({
      key: 'projectile',
      frames: [
        { key: 'projectiles', frame: 'projectile' },
        { key: 'projectiles', frame: 'smgproj' },
      ],
    });

    this.anims.create({
      key: 'projectilefast',
      duration: 100,
      frameRate: 32,
      frames: [
        { key: 'projectiles', frame: 'projectile' },
        { key: 'projectiles', frame: 'smgproj' },
      ],
    });

    this.anims.create({
      key: 'disc',
      repeat: -1,
      frameRate: 24,
      frames: [
        { key: 'projectiles', frame: 'disc00' },
        { key: 'projectiles', frame: 'disc01' },
      ],
    });

    this.anims.create({
      key: 'fire',
      repeat: -1,
      frames: [
        { key: 'projectiles', frame: 'fire00' },
        { key: 'projectiles', frame: 'fire01' },
        { key: 'projectiles', frame: 'fire02' },
      ],
    });

    this.scene.start('CrateboxScene');
  }
}

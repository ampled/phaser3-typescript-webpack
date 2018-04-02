import { Scene } from 'phaser-util/scene';

export class BootScene extends Scene {
  text: ArcadePhysicsText;
  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    this.load
      .tilemapTiledJSON('cratebox', './assets/tilemaps/cratebox.json')
      .spritesheet('cratebox', './assets/tilesets/16x16.png', { frameWidth: 64, frameHeight: 64 })
      .spritesheet('player', './assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 })
      .spritesheet('enemy', './assets/sprites/enemy.png', { frameWidth: 16, frameHeight: 16 })
      .spritesheet('star', './assets/sprites/star.png', { frameWidth: 16, frameHeight: 16 })
      .spritesheet('projectile', './assets/sprites/projectile.png', { frameWidth: 16, frameHeight: 16 })
      .bitmapFont('mario', 'assets/fonts/font.png', 'assets/fonts/font.fnt')
      .spritesheet('player-sheet', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 })
      .atlas('player-sprites', 'assets/sprites/player/player.png', 'assets/sprites/player/player.json')
      .audio('bgm', [
        'assets/music/bgm1.mp3',
        'assets/music/bgm1.ogg'
      ])
      .audioSprite('sfx', [
        'assets/sounds/sfx.ogg',
        'assets/sounds/sfx.mp3'
      ], 'assets/sounds/sfx.json' as any, { instances: 2 });

  }

  create() {
    // debugger;
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
    console.log(walk);
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
        this.scene.start('CrateboxScene');
      }
    });

    this.scene.pause('Boot');
    this.scene.start('CrateboxScene');
  }

  update(time: number, delta: number) {
    // if (this.text.body.onFloor()) console.log('floor');
    // if (this.text.body.onWall()) console.log('wall');
  }

}

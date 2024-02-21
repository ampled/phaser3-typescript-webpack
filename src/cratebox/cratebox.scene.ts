import { center, noop } from 'util/';

import { EnemySpawn, getRandomEnemySpawnEvent } from './enemy-spawn.events';
import { Enemy, SmallRobot, BigRobot, Drone } from 'cratebox/sprites/enemies';
import { Player } from 'cratebox/sprites/player';
import constants from './constants';

export class CrateboxScene extends Phaser.Scene {
  music: Phaser.Sound.WebAudioSound;
  player: Player;

  paused = false;
  pauseText: Phaser.GameObjects.BitmapText;

  cameraShakeTimer = 0;
  debugTimer = 300;

  projectileGroup: Phaser.GameObjects.Group;
  explosionGroup: Phaser.GameObjects.Group;
  enemyGroup: Phaser.GameObjects.Group;
  killedEnemies: Phaser.GameObjects.Group;

  enemySpawnEvent: Phaser.Time.TimerEvent;
  enemySpawnEventDebug: Phaser.GameObjects.BitmapText;

  difficulty = 0;

  score = 0;
  bestScore = 0;
  scoreDisplay: Phaser.GameObjects.BitmapText;
  scoreText: Phaser.GameObjects.BitmapText;
  bestScoreDisplay: Phaser.GameObjects.DynamicBitmapText;
  bestScoreText: Phaser.GameObjects.BitmapText;
  gunText: Phaser.GameObjects.DynamicBitmapText;

  keys: { [key: string]: Phaser.Input.Keyboard.Key };
  touchControls;
  gamePad: Phaser.Input.Gamepad.Gamepad;

  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  groundLayer: Phaser.Tilemaps.TilemapLayer;
  // smokeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  starCoords = [
    { x: 200, y: 120 },
    { x: 200, y: 200 },
    { x: 50, y: 60 },
    { x: 50, y: 160 },
    { x: 350, y: 60 },
    { x: 350, y: 160 },
  ];

  lastRoll = 0;
  star: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'CrateboxScene' });
  }

  create(): void {
    this.sys.sound.volume = 0.05;
    this.cameras.main.roundPixels = true;
    this.physics.world.drawDebug = false;

    // put scene functions in global scope so they can be run from clickable links under game canvas
    // tslint:disable:no-string-literal
    window['toggleTouch'] = this.toggleTouch.bind(this);
    window['togglePause'] = this.togglePause.bind(this);

    this.events.on('sfx', (sfx, rate) =>
      this.sound.playAudioSprite('sfx', sfx, { rate })
    );
    this.music = this.sound.add('bgm') as Phaser.Sound.WebAudioSound;
    this.bestScore = parseInt(window.localStorage.getItem('bestScore'), 10);
    if (isNaN(this.bestScore)) {
      this.bestScore = 0;
    }

    //#region text setup
    this.pauseText = this.add
      .bitmapText(145, 69, 'mario', 'P A U S E D !')
      .setDepth(100) as any;
    this.pauseText.setVisible(false);
    this.gunText = this.add
      .dynamicBitmapText(100, 165, 'mario', '')
      .setDepth(100) as any;
    this.gunText.letterSpacing = 3;
    this.gunText.setDisplayCallback((data: any) => {
      data.x = Phaser.Math.Between(data.x - 0.1, data.x + 0.1);
      data.y = Phaser.Math.Between(data.y - 0.1, data.y + 0.1);
      return data;
    });
    this.scoreDisplay = this.add
      .bitmapText(21, 5, 'mario', '* SCORE')
      .setDepth(100) as any;
    this.bestScoreText = this.add
      .bitmapText(316, 5, 'mario', 'BEST')
      .setDepth(100) as any;
    this.scoreText = this.add
      .bitmapText(100, 5, 'mario', this.score.toString())
      .setDepth(100) as any;
    this.bestScoreDisplay = this.add
      .dynamicBitmapText(361, 5, 'mario', this.bestScore.toString())
      .setDepth(100) as any;
    //#endregion

    this.map = this.make.tilemap({ key: 'cratebox' });
    this.tileset = this.map.addTilesetImage('cratebox', 'cratebox', 16, 16);
    this.groundLayer = this.map.createLayer('groundLayer', this.tileset, 0, 0);
    this.groundLayer.setCollisionByProperty({ collide: true });
    // this.smokeEmitter = this.add.particles(0, 0, 'projectiles', {
    //   emitting: false,
    //   frame: 'smoke',
    //   angle: { min: -120, max: 120 },
    //   scale: { start: 1.5, end: 0.5 },
    //   alpha: { start: 1, end: 0.5 },
    //   lifespan: 400,
    //   speed: { min: 50, max: 100 },
    //   // follow: this,
    //   frequency: 100,
    //   quantity: 3,
    //   blendMode: 'MULTIPLY',
    // });

    // this.setupGamePad();
    this.setupTouch();
    this.keys = this.input.keyboard.createCursorKeys();
    this.keys.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.initPlayer();

    this.projectileGroup = this.add.group({
      createCallback: (proj) => this.physics.world.enable(proj),
    });
    this.explosionGroup = this.add.group({
      createCallback: (proj) => this.physics.world.enable(proj),
    });
    this.enemyGroup = this.add.group();
    this.killedEnemies = this.add.group();

    // world / enemy hit detection
    this.physics.add.collider(this.enemyGroup as any, this.groundLayer);
    // enemy / player hit detection
    this.physics.add.overlap(
      this.enemyGroup as any,
      this.player,
      this.enemyHit
    );
    // projectile / explosion hit detection
    this.physics.add.overlap(
      this.projectileGroup as any,
      this.explosionGroup as any,
      this.projExplosionOverlap
    );
    // projectile / player hit detection (fire and disc gun)
    this.physics.add.overlap(
      this.projectileGroup,
      this.player,
      (proj: Phaser.Types.Physics.Arcade.GameObjectWithBody, player) => {
        if (proj.active && proj.getData('onPlayer')) {
          proj.getData('onPlayer')(proj, player, this);
        }
      }
    );

    // projectile / enemy hit detection
    this.physics.add.overlap(
      this.projectileGroup as any,
      this.enemyGroup as any,
      this.enemyShot as any,
      undefined,
      this
    );

    // explosions / enemy hit detection
    this.physics.add.overlap(
      this.explosionGroup as any,
      this.enemyGroup as any,
      this.enemyExplode as any
    );

    // world / projectiles hit detection
    this.physics.add.collider(
      this.projectileGroup as any,
      this.groundLayer,
      (proj: Phaser.Types.Physics.Arcade.GameObjectWithBody) => {
        if (proj.active && proj.getData('onCollide')) {
          proj.getData('onCollide')(proj, this);
        }
      },
      undefined,
      this
    );

    // pause key
    this.input.keyboard.on('keyup', (e) => {
      if (e.key === 'p') {
        this.togglePause();
      }
    });

    // mute key
    this.input.keyboard.on('keyup', (e) => {
      if (e.key === 'm') {
        if (this.sound.mute) {
          this.sound.mute = false;
        } else {
          this.sound.mute = true;
        }
      }
    });

    // debug keys
    this.input.keyboard.on('keyup', (e) => {
      if (e.key === '3') {
        this.physics.world.drawDebug = !this.physics.world.drawDebug;
        if (!this.physics.world.drawDebug) {
          this.enemySpawnEventDebug.setVisible(false);
          this.physics.world.debugGraphic.setVisible(false);
        } else {
          this.enemySpawnEventDebug.setVisible(true);
          this.physics.world.debugGraphic.setVisible(true);
        }
      } else if (e.key === '4') {
        window.localStorage.setItem('bestScore', '0');
        this.bestScore = 0;
        this.bestScoreDisplay.setText('0');
      } else if (e.key === '5') {
        console.log(this);
      } else if (e.key === 't') {
        //
      } else if (e.key === '6') {
        // tslint:disable-next-line:no-debugger
        debugger;
      } else if (e.key === 'y') {
        //
      } else if (e.key === 'w') {
        this.player.changeGun();
      } else if (e.key === 'r') {
        this.player.nextGun();
      }
    });

    this.initStar();

    // this.input.on('pointerup', (pointer) => {
    //   this.spawnDrone(pointer.x, pointer.y);
    // }, this);

    // enemy spawn interval
    this.enemySpawnEvent = this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: this.$spawnEnemy,
      callbackScope: this,
    });

    this.enemySpawnEventDebug = this.add.bitmapText(
      5,
      214,
      'mario',
      this.enemySpawnEvent.getElapsed().toString()
    );
    this.enemySpawnEventDebug.setVisible(false);
    this.enemySpawnEventDebug.setDepth(100);
  }

  update(time: number, delta: number): void {
    if (this.paused) {
      this.pause();
      return;
    }

    this.enemySpawnEventDebug.setText(
      (this.enemySpawnEvent.delay / 1000).toFixed(1).toString() +
        ' ' +
        (
          (this.enemySpawnEvent.delay - this.enemySpawnEvent.getElapsed()) /
          1000
        )
          .toFixed(1)
          .toString()
    );

    this.cameraShakeTimer -= delta;
    this.debugTimer -= delta;

    if (this.cameraShakeTimer < 0) {
      this.cameras.main.x = 0;
      this.cameras.main.y = 0;
      this.cameras.main.setRotation(0);
    } else {
      this.minishake(false);
    }

    if (this.keys.shift.isDown && this.debugTimer < 0) {
      // this.spawnEnemy(true);
      this.spawnDrone();
      this.debugTimer = 300;
    }

    this.player.update(time, delta);
    this.enemyGroup.children.entries.forEach(
      (enemy) => enemy.update(time, delta),
      this
    );
    this.killedEnemies.children.entries.forEach(
      (enemy) => enemy.update(time, delta),
      this
    );
    this.projectileGroup.children.entries.forEach((proj) =>
      proj.active && proj.update ? proj.update(time, delta) : noop()
    );
  }

  togglePause(): void {
    if (this.paused) {
      this.scene.resume('CrateboxScene');
      this.sound.resumeAll();
      this.sys.sound.playAudioSprite('sfx', 'pause');
      this.paused = false;
    } else {
      this.scene.pause('CrateboxScene');
      this.sound.pauseAll();
      this.paused = true;
    }
    this.pauseText.setVisible(this.paused);
  }

  setupGamePad(): void {
    this.gamePad = this.input.gamepad.getPad(0);
    console.log(this.gamePad);
  }

  setupTouch(): void {
    const jumpButton = this.add.sprite(370, 210, 'dir');
    const shootButton = this.add.sprite(310, 210, 'shoot');
    const leftButton = this.add.sprite(30, 210, 'dir');
    const rightButton = this.add.sprite(90, 210, 'dir');
    jumpButton.setAngle(-90).setInteractive();
    jumpButton.setAlpha(0.6).setInteractive();
    shootButton.setAlpha(0.6).setInteractive();
    leftButton.setAlpha(0.6).setInteractive();
    rightButton.setAlpha(0.6).setInteractive();
    leftButton.flipX = true;
    this.touchControls = {
      visible: false,
      buttons: [jumpButton, shootButton, leftButton, rightButton],
      left: false,
      right: false,
      up: false,
      shoot: false,
    };
    jumpButton.on('pointerdown', (pointer) => {
      this.touchControls.up = true;
    });
    jumpButton.on('pointerup', (pointer) => {
      this.touchControls.up = false;
    });
    shootButton.on('pointerdown', (pointer) => {
      this.touchControls.shoot = true;
    });
    shootButton.on('pointerup', (pointer) => {
      this.touchControls.shoot = false;
    });
    leftButton.on('pointerdown', (pointer) => {
      this.touchControls.left = true;
      this.touchControls.right = false;
    });
    leftButton.on('pointerup', (pointer) => {
      this.touchControls.left = false;
    });
    rightButton.on('pointerdown', (pointer) => {
      this.touchControls.right = true;
      this.touchControls.left = false;
    });
    rightButton.on('pointerup', (pointer) => {
      this.touchControls.right = false;
    });

    this.toggleTouch();
  }

  toggleTouch = () => {
    this.touchControls.visible = !this.touchControls.visible;
    if (this.touchControls.visible) {
      this.touchControls.buttons.forEach((button) => button.setAlpha(0));
    } else {
      this.touchControls.buttons.forEach((button) => button.setAlpha(0.6));
    }
  };

  pause(): void {
    this.scene.pause('CrateboxScene');
    this.sound.pauseAll();
    this.paused = true;
    this.pauseText.setVisible(this.paused);
  }

  unpause(): void {
    this.scene.resume('CrateboxScene');
    this.sound.resumeAll();
    this.paused = false;
    this.pauseText.setVisible(this.paused);
  }

  initPlayer(): void {
    this.player = new Player(
      this,
      200,
      152,
      'player-sprites',
      this.groundLayer
    );
    this.player.anims.play('stand');
    this.add.existing(this.player);
  }

  initStar(): void {
    if (this.star) {
      this.star.destroy();
    }
    const starPosition = this.getStarPosition();

    this.star = this.add.sprite(starPosition.x, starPosition.y, 'star');

    this.physics.world.enable(this.star, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.add.overlap(this.star, this.player, this.starGet as any);
  }

  getStarPosition(): { x: number; y: number } {
    const roll = Math.floor(Math.random() * this.starCoords.length);
    if (roll !== this.lastRoll) {
      this.lastRoll = roll;
      return this.starCoords[roll];
    } else {
      return this.getStarPosition();
    }
  }

  starGet = (star: Phaser.Types.Physics.Arcade.GameObjectWithBody, player) => {
    const newPos = this.getStarPosition();
    star.body.x = newPos.x - 8;
    star.body.y = newPos.y - 8;
    this.star.setX(newPos.x);
    this.star.setY(newPos.y);
    if (!this.music.isPlaying) {
      this.restartMusic();
    }
    this.score += 1;
    this.scoreText.setText(this.score.toString());
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreDisplay.setText(this.bestScore.toString() + ' !');
      this.bestScoreDisplay.setDisplayCallback((data: any) => {
        data.x = Phaser.Math.Between(data.x - 0.1, data.x + 0.1);
        data.y = Phaser.Math.Between(data.y - 0.1, data.y + 0.1);
        return data;
      });
    }
    // this.cameras.main.flash(100, 1, 1, .5);
    if (this.score % 10 === 0) {
      this.events.emit('sfx', 'starget_alt');
    } else {
      this.events.emit('sfx', 'starget');
    }
    this.player.changeGun();
    this.setDifficultyLevel();
  };

  setDifficultyLevel(): void {
    if (this.score >= 10 && this.score < 20) {
      this.difficulty = 1;
    } else if (this.score >= 20 && this.score < 35) {
      this.difficulty = 2;
    } else if (this.score >= 35 && this.score < 50) {
      this.difficulty = 3;
    } else if (this.score >= 50 && this.score < 100) {
      this.difficulty = 4;
    } else if (this.score >= 100) {
      this.difficulty = 5;
    }
  }

  $spawnEnemy = (): void => {
    if (!constants.ENEMY_SPAWNS_ENABLED) return;
    const event = getRandomEnemySpawnEvent(this.difficulty);
    if (event === EnemySpawn.NORMAL) {
      this.spawnEnemy();
    } else if (event === EnemySpawn.NORMALDUO) {
      this.spawnEnemySquad();
    } else if (event === EnemySpawn.BIG) {
      this.spawnEnemy(true);
    } else if (event === EnemySpawn.NORMALWAVE) {
      this.spawnEnemyWave();
    } else if (event === EnemySpawn.DRONE) {
      this.spawnDrone();
    }
  };

  spawnEnemy = (big = false): void => {
    if (big) {
      this.enemyGroup.add(
        new BigRobot(this, 200, 0, Math.floor(Math.random() * 2)),
        true
      );
    } else {
      this.enemyGroup.add(
        new SmallRobot(this, 200, 0, Math.floor(Math.random() * 2)),
        true
      );
    }
  };

  spawnDrone = (x = 200, y = 0): void => {
    this.enemyGroup.add(
      new Drone(this, x, y, Math.floor(Math.random() * 2)),
      true
    );
  };

  spawnEnemySquad(amount = 2): void {
    const enemies: Enemy[] = [];
    let dir = 1;
    for (let i = 0; i < amount; i++) {
      enemies.push(new SmallRobot(this, 200, 0, dir));
      if (dir === 1) {
        dir = 2;
      } else {
        dir = 1;
      }
    }
    this.enemyGroup.addMultiple(enemies, true);
  }

  spawnEnemyWave(): void {
    const dir = Math.floor(Math.random() * 2);

    this.time.addEvent({
      delay: 300,
      repeat: 2,
      callbackScope: this,
      callback() {
        this.enemyGroup.add(new SmallRobot(this, 200, 0, dir), true);
      },
    });
  }

  enemyExplode = (proj: Phaser.GameObjects.Sprite, enemy: Enemy) => {
    if (enemy.canDamage) {
      this.events.emit('sfx', 'enemyshot', 2);
      let fromRight = true;
      let multiplier = 1;
      if (proj.x < enemy.x) {
        fromRight = false;
      }
      if (proj.getData('force')) {
        multiplier = proj.getData('force');
      }
      if (proj.getData('onEnemy')) {
        proj.getData('onEnemy')(proj, enemy);
      }
      enemy.damage(proj.getData('dmg'), fromRight, multiplier);
    }
  };

  enemyShot = (proj: Phaser.GameObjects.Sprite, enemy: Enemy) => {
    if (enemy.canDamage || proj.getData('bypass')) {
      const scene = this as CrateboxScene;
      scene.sys.sound.playAudioSprite('sfx', 'enemyshot');
      let fromRight = true;
      let shouldFlip = false;
      let multiplier = 1;
      if (proj.x < enemy.x) {
        fromRight = false;
      }
      if (fromRight && enemy.body.velocity.x > 0 && proj.getData('flip')) {
        shouldFlip = true;
      } else if (
        !fromRight &&
        enemy.body.velocity.x < 0 &&
        proj.getData('flip')
      ) {
        shouldFlip = true;
      }
      if (proj.getData('force')) {
        multiplier = proj.getData('force');
      }

      enemy.damage(proj.getData('dmg'), fromRight, multiplier, shouldFlip);
      if (proj.getData('onEnemy')) {
        proj.getData('onEnemy')(proj, enemy, scene);
      }
      if (!proj.getData('melee')) {
        proj.destroy();
      }
    }
  };

  enemyHit = (enemy, player) => {
    this.restart();
  };

  projExplosionOverlap = (proj, explosion) => {
    if (proj.getData('inExplosion')) {
      proj.getData('inExplosion')(proj, undefined, this);
    }
  };

  minishake(resetTimer = true): void {
    const shakeX = Phaser.Math.Between(-2, 2);
    const shakeY = Phaser.Math.Between(-2, 2);
    this.cameras.main.x = shakeX;
    this.cameras.main.y = shakeY;
    if (resetTimer) {
      this.cameraShakeTimer = 150;
    }
  }

  flashGunName(name: string): void {
    this.gunText.setText(center(name + '!', 18)).setVisible(true);
    this.time.addEvent({
      delay: 2500,
      callback: () => {
        this.gunText.setVisible(false);
      },
    });
  }

  restart(): void {
    this.enemySpawnEvent.destroy();
    this.enemySpawnEvent = this.time.addEvent({
      delay: constants.ENEMY_SPAWN_TIME,
      loop: true,
      callback: this.$spawnEnemy,
      callbackScope: this,
    });

    // this.smokeEmitter.destroy();
    this.difficulty = 0;
    this.sys.sound.playAudioSprite('sfx', 'death');
    this.cameras.main.shake(200, 0.01).flash(200, 255, 0, 0);
    this.score = 0;
    this.lastRoll = 1;
    this.initStar();
    this.scoreText.setText(this.score.toString());
    this.bestScoreDisplay.setText(this.bestScore.toString());
    this.bestScoreDisplay.setDisplayCallback((data) => data);
    this.enemyGroup.clear(true);
    this.projectileGroup.clear(true);
    this.killedEnemies.clear(true);

    this.player.x = 200;
    this.player.y = 140;
    this.player.body.setVelocity(0, 0);
    this.player.resetGun(this.player.x, this.player.y);
    window.localStorage.setItem('bestScore', this.bestScore.toString());
    this.music.stop();
  }

  restartMusic(): void {
    this.music.stop();
    // this.music.setRate(0.5);
    this.music.play('', { loop: true, volume: 0.3 });
  }

  createSmokeEmitter(x: number, y: number, id: string, follow: any) {
    return this.add.particles(x, y, 'projectiles', {
      name: 'smoke' + id,
      frame: 'smoke',
      // angle: { min: -120, max: 120 },
      scale: { start: 1.5, end: 0.5 },
      alpha: { start: 1, end: 0.5 },
      lifespan: 400,
      speed: { min: 50, max: 100 },
      follow,
      frequency: 100,
      quantity: 3,
      blendMode: 'MULTIPLY',
    });
  }
}

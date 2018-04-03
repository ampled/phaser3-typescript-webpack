import { Scene } from 'phaser-util/scene';
import { Player } from 'cratebox/sprites/player.sprite';
import { Enemy } from 'cratebox/sprites/enemy.sprite';

export class CrateboxScene extends Scene {
  paused = true;
  pauseText: Phaser.GameObjects.BitmapText;

  music: Phaser.Sound.BaseSound;

  player: Player;
  gun: Phaser.GameObjects.Sprite;
  gunBody: Phaser.Physics.Arcade.Body;

  jumpTimer = 0;
  shootTimer = 0;

  cameraShakeTimer = 0;

  projectiles: Phaser.Physics.Arcade.Group;
  enemyGroup: Phaser.Physics.Arcade.Group;
  killedEnemies: Phaser.Physics.Arcade.Group;
  enemySpawnTimer = 2500;
  enemySpawnTime = 5000;
  enemySpawnTimeDebug: Phaser.GameObjects.BitmapText;
  debugTimer = 300;

  score = 0;
  scoreDisplay: Phaser.GameObjects.BitmapText;
  scoreText: Phaser.GameObjects.BitmapText;

  bestScore = 0;
  bestScoreDisplay: Phaser.GameObjects.DynamicBitmapText;
  bestScoreText: Phaser.GameObjects.BitmapText;

  cursors: { [key: string]: Phaser.Input.Keyboard.Key };

  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  groundLayer: Phaser.Tilemaps.StaticTilemapLayer;

  starCoords = [
    { x: 200, y: 40 },
    { x: 200, y: 120 },
    { x: 200, y: 200 },
    { x: 50, y: 60 },
    { x: 50, y: 160 },
    { x: 350, y: 60 },
    { x: 350, y: 160 }
  ];
  lastRoll = 1;
  star: Phaser.GameObjects.Sprite;
  starBody: Phaser.Physics.Arcade.Body;

  debugGraphic;

  constructor() {
    super({ key: 'CrateboxScene' });
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

  create(): void {
    this.music = this.sound.add('bgm');

    this.bestScore = parseInt(window.localStorage.getItem('bestScore'), 10);
    if (isNaN(this.bestScore)) {
      this.bestScore = 0;
    }
    this.cameras.main.roundPixels = true;
    this.debugGraphic = this.physics.world.debugGraphic;
    this.physics.world.drawDebug = false;
    this.physics.world.debugGraphic = null;

    this.pauseText = this.add.bitmapText(145, 69, 'mario', 'P A U S E D !').setDepth(100) as any;
    this.pauseText.setVisible(false);

    this.scoreDisplay = this.add.bitmapText(5, 5, 'mario', 'SCORE').setDepth(100) as any;
    this.bestScoreText = this.add.bitmapText(300, 5, 'mario', 'BEST').setDepth(100) as any;

    this.scoreText =
      this.add.bitmapText(55, 5, 'mario', this.score.toString()).setDepth(100) as any;
    this.bestScoreDisplay =
      this.add.dynamicBitmapText(350, 5, 'mario', this.bestScore.toString()).setDepth(100) as any;
    this.enemySpawnTimeDebug =
      this.add.bitmapText(5, 214, 'mario', Math.floor(this.enemySpawnTimer / 100).toString()).setDepth(100) as any;
    this.enemySpawnTimeDebug.setVisible(false);

    this.map = this.make.tilemap({ key: 'cratebox' });
    this.tileset = this.map.addTilesetImage('cratebox', 'cratebox', 16, 16);
    this.groundLayer = this.map.createStaticLayer('groundLayer', this.tileset, 0, 0);
    this.groundLayer.setCollisionByProperty({ collide: true });
    this.groundLayer.setZ(1);

    this.cursors = this.input.keyboard.createCursorKeys() as any;
    this.cursors.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.projectiles = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.killedEnemies = this.physics.add.group();
    this.initPlayer();

    this.physics.add.collider(this.enemyGroup as any, this.groundLayer as any);
    this.physics.add.overlap(this.enemyGroup as any, this.player as any, this.enemyHit);
    this.physics.add.overlap(this.projectiles as any, this.enemyGroup as any, this.enemyShot as any);

    this.physics.add.collider(
      this.projectiles as any,
      this.groundLayer as any,
      (proj) => {
        proj.destroy();
        this.sys.sound.playAudioSprite('sfx', 'foley', { volume: .4 } as any);
      },
      undefined, this);

    this.spawnStar();

    this.input.keyboard.on('keyup', e => {
      if (e.key === 'p') {
        this.togglePause();
      }
    });

    this.input.keyboard.on('keyup', e => {
      if (e.key === 'm') {
        if (this.sound.mute) {
          this.sound.setMute(false);
        } else {
          this.sound.setMute(true);
        }
      }
    });
    this.input.keyboard.on('keyup', e => {
      if (e.key === '3') {
        this.physics.world.drawDebug = !this.physics.world.drawDebug;
        if (!this.physics.world.drawDebug) {
          this.enemySpawnTimeDebug.setVisible(false);
          this.physics.world.debugGraphic = null;
        } else {
          this.enemySpawnTimeDebug.setVisible(true);
          this.physics.world.debugGraphic = this.debugGraphic;
        }
      } else if (e.key === '4') {
        window.localStorage.setItem('bestScore', '0');
        this.bestScore = 0;
        this.bestScoreDisplay.setText('0');
      }
    });
  }

  update(time: number, delta: number): void {
    if (this.paused) { this.pause(); return; }

    this.gun.x = this.player.flipX ? this.player.x - 8 : this.player.x + 8;
    this.gun.y = this.player.y;
    this.gun.flipX = this.player.flipX;

    if (this.gun.flipX) {
      this.gun.setDepth(11);
    } else {
      this.gun.setDepth(9);
    }

    if (this.player.body.onFloor() && this.player.falling) {
      this.sys.sound.playAudioSprite('sfx', 'foley', { volume: 1 } as any);
    }

    this.player.falling = this.player.body.velocity.y > 50;

    this.cameraShakeTimer -= delta;
    if (this.cameraShakeTimer < 0) {
      this.cameras.main.x = 0;
      this.cameras.main.y = 0;
      this.cameras.main.setRotation(0);
    } else {
      this.minishake(false);
    }

    if (this.player.y > 400) { this.restart(); }

    this.enemySpawnTimer = this.enemySpawnTimer -= delta;
    this.enemySpawnTimeDebug.setText(
      (this.enemySpawnTime / 1000).toFixed(1).toString() + ' ' + (this.enemySpawnTimer / 1000).toFixed(1).toString()
    );
    this.shootTimer -= delta;
    this.debugTimer -= delta;

    if (this.score >= 10 && this.score < 20) {
      this.enemySpawnTime = 4500;
    } else if (this.score >= 20 && this.score < 35) {
      this.enemySpawnTime = 4000;
    } else if (this.score >= 35 && this.score < 50) {
      this.enemySpawnTime = 3500;
    } else if (this.score >= 50 && this.score < 100) {
      this.enemySpawnTime = 2000;
    } else if (this.score >= 100) {
      this.enemySpawnTime = 1500;
    }

    if (this.enemySpawnTimer < 0) {
      this.spawnEnemy();
    }

    if (this.cursors.shift.isDown && this.debugTimer < 0) {
      this.spawnEnemy();
      this.debugTimer = 300;
    }

    if (this.cursors.X.isDown) {
      if (this.shootTimer < 0) {
        this.shoot();
      }
    }

    if (this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.setVelocityX(-100);
      this.player.dir = 'l';
      this.player.flipX = true;
    } else if (this.cursors.right.isDown && !this.cursors.left.isDown) {
      this.player.setVelocityX(100);
      this.player.dir = 'r';
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown || this.cursors.space.isDown) {
      if (this.player.body.onFloor() && this.jumpTimer === 0) {
        this.jumpTimer = 1;
        this.player.body.setVelocityY(-150);
        this.sys.sound.playAudioSprite('sfx', 'jump');
      } else if (this.jumpTimer > 0 && this.jumpTimer < 301 && !this.player.body.onCeiling()) {
        this.jumpTimer += delta;
        this.player.body.setVelocityY(-150);
      } else if (this.player.body.onCeiling()) {
        this.sys.sound.playAudioSprite('sfx', 'foley');
        this.jumpTimer = 0;
      }
    } else {
      this.jumpTimer = 0;
    }

    this.player.update(time, delta);

    this.enemyGroup.children.entries.forEach(
      enemy => enemy.update(time, delta), this
    );

    this.killedEnemies.children.entries.forEach(
      enemy => enemy.update(time, delta), this
    );

  }

  initPlayer(): void {
    this.player = new Player(this, 200, 150, 'player');
    this.physics.add.collider(this.player as any, this.groundLayer as any);
    this.physics.add.existing(this.player as any);
    this.player.setSize(11, 16);
    this.add.existing(this.player as any);
    this.player.setDepth(10);
    this.gun = this.add.sprite(this.player.x, this.player.y, 'gun');
    // this.gun.setAlpha(0);
    this.physics.add.existing(this.gun);
    this.gunBody = this.gun.body as any;
    this.gunBody.setGravityY(-600);
  }

  spawnStar(): void {
    const starPosition = this.getStarPosition();
    this.star =
      this.make.sprite({ scene: this, key: 'star', x: starPosition.x, y: starPosition.y });
    this.physics.world.enable(this.star, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.add.overlap(this.star as any, this.player as any, this.starGet);
    // this.starBody = this.star.body as any;
    // this.starBody.setGravityY(-600);
    // this.starBody.setAngularVelocity(100);
  }

  getStarPosition(): { x: number, y: number } {
    const roll = Math.floor(Math.random() * this.starCoords.length);
    if (roll !== this.lastRoll) {
      this.lastRoll = roll;
      return this.starCoords[roll];
    } else {
      return this.getStarPosition();
    }
  }

  starGet = (star: Phaser.GameObjects.Sprite, player) => {
    this.sys.sound.playAudioSprite('sfx', 'starget');
    if (!this.music.isPlaying) {
      this.restartMusic();
    }
    star.destroy();
    this.score += 1;
    this.scoreText.setText(this.score.toString());
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreDisplay.setText(this.bestScore.toString() + ' !');
      this.bestScoreDisplay.setDisplayCallback((data: any) => {
        data.x = Phaser.Math.Between(data.x - .1, data.x + .1);
        data.y = Phaser.Math.Between(data.y - .1, data.y + .1);
        return data;
      });
    }
    // this.cameras.main.flash(100, 1, 1, .5);
    this.spawnStar();
  }

  spawnEnemy(): void {
    this.enemyGroup.add(
      new Enemy(
        this, 200, 0, 'enemy',
        Math.floor(Math.random() * 2)) as any, true
    );
    this.enemySpawnTimer = this.enemySpawnTime;
  }

  spawnEnemySquad(): void {
    this.enemyGroup.addMultiple(new Enemy(
      this, 200, 0, 'enemy',
      Math.floor(Math.random() * 2)) as any, true);
  }

  enemyShot = (proj, enemy: Enemy) => {
    this.sys.sound.playAudioSprite('sfx', 'enemyshot');
    let fromRight = true;
    if (proj.x < enemy.x) {
      fromRight = false;
    }
    enemy.damage(3, fromRight);
    proj.destroy();
  }

  enemyHit = (enemy, player) => {
    this.restart();
  }

  shoot(): void {
    this.sound
      .playAudioSprite('sfx', 'shoot', { rate: 1 } as any);
    // this.player.shooting = true;
    const projectile =
      this.projectiles.create(this.gun.x, this.gun.y, 'projectile');
    const projBod = projectile.body as Phaser.Physics.Arcade.Body;
    let vel = 600;
    if (this.player.dir === 'l') {
      vel = -vel;
    }
    // this.gun.setAngle(this.gun.flipX ? 30 : -30);
    this.gunBody.setAngularVelocity(this.gun.flipX ? 200 : -200);
    // this.minishake();
    projBod
      .setSize(10, 10)
      .setVelocity(vel, 0)
      .setGravityY(-600);
    this.shootTimer = 300;
  }

  minishake(resetTimer = true): void {
    const shakeX = Phaser.Math.Between(-2, 2);
    const shakeY = Phaser.Math.Between(-2, 2);
    // const rotation = Phaser.Math.FloatBetween(-.02, .02);
    // this.cameras.main.setRotation(rotation);

    this.cameras.main.x = shakeX;
    this.cameras.main.y = shakeY;
    if (resetTimer) {
      this.cameraShakeTimer = 150;
    }
  }

  restart(): void {
    this.sys.sound.playAudioSprite('sfx', 'death');
    this.cameras.main.shake(200);
    this.cameras.main.flash(200, 1, 0, 0);
    this.score = 0;
    this.lastRoll = 1;
    this.star.destroy();
    this.spawnStar();
    this.scoreText.setText(this.score.toString());
    this.bestScoreDisplay.setText(this.bestScore.toString());
    this.bestScoreDisplay.setDisplayCallback((data) => data);
    this.enemyGroup.clear(true);
    this.player.x = 200;
    this.player.y = 150;
    this.spawnEnemy();
    this.enemySpawnTimer = 2500;
    this.enemySpawnTime = 5000;
    window.localStorage.setItem('bestScore', this.bestScore.toString());
    this.music.stop();
  }

  restartMusic(): void {
    this.music.stop();
    this.music.play({ loop: true, volume: 0.3 } as any);
  }

}

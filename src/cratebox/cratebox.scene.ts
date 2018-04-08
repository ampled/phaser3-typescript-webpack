import { Scene } from 'phaser-util/scene';
import { Enemy } from 'cratebox/sprites/enemy';
import { Player } from 'cratebox/sprites/player';

export class CrateboxScene extends Scene {
  paused = true;
  pauseText: Phaser.GameObjects.BitmapText;
  music: Phaser.Sound.BaseSound;
  player: Player;

  sleepTimer = 0;
  cameraShakeTimer = 0;
  debugTimer = 300;

  projectileGroup: Phaser.GameObjects.Group;

  enemyGroup: Phaser.Physics.Arcade.Group;
  killedEnemies: Phaser.Physics.Arcade.Group;
  enemySpawnTimer = 2500;
  enemySpawnTime = 5000;
  enemySpawnTimeDebug: Phaser.GameObjects.BitmapText;

  score = 0;
  scoreDisplay: Phaser.GameObjects.BitmapText;
  scoreText: Phaser.GameObjects.BitmapText;
  gunText: Phaser.GameObjects.BitmapText;
  gunTextTimer: number = 1001;
  bestScore = 0;
  bestScoreDisplay: Phaser.GameObjects.DynamicBitmapText;
  bestScoreText: Phaser.GameObjects.BitmapText;

  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  groundLayer: Phaser.Tilemaps.StaticTilemapLayer;

  shotgunVelocity = 50;
  shotgunDrag = 50;

  // TODO get these from the tiled map as objects
  starCoords = [
    { x: 200, y: 40 },
    { x: 200, y: 120 },
    { x: 200, y: 200 },
    { x: 50, y: 60 },
    { x: 50, y: 160 },
    { x: 350, y: 60 },
    { x: 350, y: 160 }
  ];
  // Default one so the first star does not spawn close to the player
  lastRoll = 1;
  star: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'CrateboxScene' });
  }

  create(): void {
    console.log(this);
    this.events.on('sfx', (sfx) => this.sound.playAudioSprite('sfx', sfx));
    this.music = this.sound.add('bgm');
    this.bestScore = parseInt(window.localStorage.getItem('bestScore'), 10);
    if (isNaN(this.bestScore)) {
      this.bestScore = 0;
    }

    this.cameras.main.roundPixels = true;
    this.physics.world.drawDebug = false;

    //#region text setup
    this.pauseText = this.add.bitmapText(145, 69, 'mario', 'P A U S E D !').setDepth(100) as any;
    this.pauseText.setVisible(false);
    this.gunText = this.add.bitmapText(100, 165, 'mario', '').setDepth(100) as any;
    this.scoreDisplay = this.add.bitmapText(21, 5, 'mario', '* SCORE').setDepth(100) as any;
    this.bestScoreText = this.add.bitmapText(316, 5, 'mario', 'BEST').setDepth(100) as any;
    this.scoreText =
      this.add.bitmapText(100, 5, 'mario', this.score.toString()).setDepth(100) as any;
    this.bestScoreDisplay =
      this.add.dynamicBitmapText(361, 5, 'mario', this.bestScore.toString()).setDepth(100) as any;
    this.enemySpawnTimeDebug =
      this.add.bitmapText(5, 214, 'mario', Math.floor(this.enemySpawnTimer / 100).toString()).setDepth(100) as any;
    this.enemySpawnTimeDebug.setVisible(false);
    //#endregion

    this.map = this.make.tilemap({ key: 'cratebox' });
    this.tileset = this.map.addTilesetImage('cratebox', 'cratebox', 16, 16);
    this.groundLayer = this.map.createStaticLayer('groundLayer', this.tileset, 0, 0);
    this.groundLayer.setCollisionByProperty({ collide: true });

    this.keys = this.input.keyboard.createCursorKeys() as any;
    this.keys.X = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.projectileGroup =
      this.add.group({
        createCallback: proj => this.physics.world.enable(proj)
      } as any);
    this.enemyGroup = this.physics.add.group();
    this.killedEnemies = this.physics.add.group();

    this.initPlayer();

    this.physics.add.collider(this.enemyGroup as any, this.groundLayer as any);
    this.physics.add.overlap(this.enemyGroup as any, this.player as any, this.enemyHit);
    this.physics.add.overlap(this.projectileGroup as any, this.enemyGroup as any, this.enemyShot as any);

    this.physics.add.collider(
      this.projectileGroup as any,
      this.groundLayer as any,
      (proj) => {
        if (proj.active) { proj.getData('onCollide')(proj, this); }
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
          this.physics.world.debugGraphic.setVisible(false);
        } else {
          this.enemySpawnTimeDebug.setVisible(true);
          this.physics.world.debugGraphic.setVisible(true);
        }
      } else if (e.key === '4') {
        window.localStorage.setItem('bestScore', '0');
        this.bestScore = 0;
        this.bestScoreDisplay.setText('0');
      } else if (e.key === '5') {
        this.shotgunVelocity += 10;
        console.log('vel', this.shotgunVelocity);
      } else if (e.key === 't') {
        this.shotgunVelocity -= 10;
        console.log('vel', this.shotgunVelocity);
      } else if (e.key === '6') {
        this.shotgunDrag += 10;
        console.log('drag', this.shotgunDrag);
      } else if (e.key === 'y') {
        this.shotgunDrag -= 10;
        console.log('drag', this.shotgunDrag);
      }
    });
  }

  update(time: number, delta: number): void {
    if (this.paused) { this.pause(); return; }

    if (this.gunTextTimer > 2500) {
      this.gunText.setVisible(false);
    }

    this.cameraShakeTimer -= delta;
    this.debugTimer -= delta;
    this.enemySpawnTimer -= delta;
    this.gunTextTimer += delta;

    if (this.cameraShakeTimer < 0) {
      this.cameras.main.x = 0;
      this.cameras.main.y = 0;
      this.cameras.main.setRotation(0);
    } else {
      this.minishake(false);
    }

    this.enemySpawnTimeDebug.setText(
      (this.enemySpawnTime / 1000).toFixed(1).toString()
      + ' ' +
      (this.enemySpawnTimer / 1000).toFixed(1).toString()
    );

    if (this.enemySpawnTimer < 0) {
      this.spawnEnemy();
    }
    if (this.keys.shift.isDown && this.debugTimer < 0) {
      this.spawnEnemy();
      this.debugTimer = 300;
    }

    this.player.update(time, delta);
    this.enemyGroup.children.entries.forEach(
      enemy => enemy.update(time, delta), this
    );
    this.killedEnemies.children.entries.forEach(
      enemy => enemy.update(time, delta), this
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
    this.player = new Player(this, 200, 152, 'player-sprites', this.groundLayer);
    this.player.anims.play('stand');
    this.add.existing(this.player);
  }

  spawnStar(): void {
    if (this.star) {
      this.star.destroy();
    }
    const starPosition = this.getStarPosition();
    this.star =
      this.make.sprite({ scene: this, key: 'star', x: starPosition.x, y: starPosition.y });
    this.physics.world.enable(this.star, Phaser.Physics.Arcade.STATIC_BODY);
    this.physics.add.overlap(this.star as any, this.player as any, this.starGet);
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
    const newPos = this.getStarPosition();
    (<Phaser.Physics.Arcade.StaticBody>star.body).x = newPos.x - 8;
    (<Phaser.Physics.Arcade.StaticBody>star.body).y = newPos.y - 8;
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
        data.x = Phaser.Math.Between(data.x - .1, data.x + .1);
        data.y = Phaser.Math.Between(data.y - .1, data.y + .1);
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
    this.setEnemySpawnTime();
  }

  setEnemySpawnTime(): void {
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

  enemyShot = (proj: Phaser.GameObjects.GameObject, enemy: Enemy) => {
    console.log('enemyShot');
    this.sys.sound.playAudioSprite('sfx', 'enemyshot');
    let fromRight = true;
    let multiplier = 1;
    if ((<any>proj).x < enemy.x) {
      fromRight = false;
    }
    if (proj.getData('force')) {
      multiplier = proj.getData('force');
    }
    enemy.damage(proj.getData('dmg'), fromRight, multiplier);
    proj.destroy();
  }

  enemyHit = (enemy, player) => {
    this.restart();
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

  flashGunName(name: string): void {
    const padText = '     ';
    this.gunText.setText(padText + name + ' !').setVisible(true);
    this.gunTextTimer = 0;
  }

  restart(): void {
    this.enemySpawnTimer = 5000;
    this.enemySpawnTime = 5000;
    this.sys.sound.playAudioSprite('sfx', 'death');
    this.cameras.main.shake(200);
    this.cameras.main.flash(200, 1, 0, 0);
    this.score = 0;
    this.lastRoll = 1;
    this.spawnStar();
    this.scoreText.setText(this.score.toString());
    this.bestScoreDisplay.setText(this.bestScore.toString());
    this.bestScoreDisplay.setDisplayCallback((data) => data);
    this.enemyGroup.clear(true);
    this.player.x = 200;
    this.player.y = 150;
    this.player.resetGun(this.player.x, this.player.y);
    window.localStorage.setItem('bestScore', this.bestScore.toString());
    this.music.stop();
  }

  restartMusic(): void {
    this.music.stop();
    this.music.play({ loop: true, volume: 0.3 } as any);
  }

}

import { Enemy } from './enemy_base';

export class Drone extends Enemy {
  baseVel: number = 50;
  madVel: number = 70;
  vel: number = 50;
  baseAccel: number = 70;
  madAccel: number = 100;
  accel: number = 70;

  baseHealth = 8;
  health = 8;
  isFirst = true;
  canDamage = true;
  isMad = false;
  animWalk: string = 'drone';
  animMad: string = 'dronemad';

  smoke: Phaser.GameObjects.Particles.ParticleEmitter;

  isMoving = false;
  moveEvent: Phaser.Time.TimerEvent;

  getOutOfTopY = 60;
  getOutOfTopX1 = 300;
  getOutOfTopX2 = 100;



  constructor(scene, x, y, public dir) {
    super(scene, x, y, dir, 'enemies');
  }

  firstUpdate(): void {
    this.anims.play(this.animWalk);
    // this.vel = this.dir === 1 ? -this.baseVel : this.baseVel;
    this.body.setBounce(1, 1.5).setSize(16, 12).allowGravity = false;
    // this.body.gravity = new Phaser.Math.Vector2(2, 2);
    this.isFirst = false;
    this.scene.add.sprite(this.getOutOfTopX1, this.getOutOfTopY, 'projectiles', 'smgproj');
    this.scene.add.sprite(this.getOutOfTopX2, this.getOutOfTopY, 'projectiles', 'smgproj');
    this.scene.add.sprite(300, 180, 'projectiles', 'smgproj');
    this.scene.add.sprite(100, 180, 'projectiles', 'smgproj');
  }

  update(time: number, delta: number) {
    if (this.isFirst) {
      this.firstUpdate();
    }

    if (this.isDead) {
      return;
    }

    this.flipX = this.scene.player.x < this.x;

    if (this.y > 240) {
      this.isMad = true;
      this.smoke = this.scene.smokeEmitter
        .createEmitter({
          frame: 'smoke',
          angle: { min: -120, max: 120 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 1, end: .5 },
          lifespan: 400,
          speed: { min: 50, max: 100 },
          follow: this,
          frequency: 100,
          quantity: 3,
          blendMode: 'MULTIPLY'
        });
      this.y = -5;
      this.x = 200;
      this.health = this.baseHealth;
      this.vel = this.madVel;
      this.accel = this.madAccel;
      this.scene.minishake();
      this.anims.play('dronemad');
      this.scene.events.emit('sfx', 'enemyloop');
    }

    if (!this.isMoving) {
      this.isMoving = true;

      let x = 200;
      let y = 240;
      const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
      const distanceToPit = Phaser.Math.Distance.Between(this.x, this.y, 120, 400) - 200;

      // console.log('distplayer', distanceToPlayer);
      // console.log('distpit', distanceToPit);

      if (distanceToPlayer < distanceToPit && this.y < 170) {
        console.log('go to player');
        x = this.scene.player.x;
        y = this.scene.player.y - 16;
      } else {
        console.log('go to pit');
        if (this.y > 80 && this.y < 160) {
          if (this.dir !== 1) {
            x = Phaser.Math.Between(40, 60);
          } else {
            x = Phaser.Math.Between(310, 350);
          }
        }
      }
      if (this.y < this.getOutOfTopY && (this.x < this.getOutOfTopX1 && this.x > this.getOutOfTopX2)) {
        console.log('get out of top');
        y = 40;
        if (this.dir === 1) {
          x = Phaser.Math.Between(20, 60);
        } else {
          x = Phaser.Math.Between(310, 350);
        }
      }

      this.scene.physics.accelerateTo(this, x, y, this.accel, this.vel, this.vel);
      // const pointer = this.scene.add.sprite(x, y, 'projectiles', 'smgproj').setTint(0);
      this.moveEvent = this.scene.time.addEvent({
        delay: Phaser.Math.Between(1000, 2000),
        callbackScope: this,
        callback: () => {
          this.anims.currentAnim.pause();
          this.body.setAcceleration(0, 0).setVelocity(this.body.velocity.x / 3, 5);
          this.scene.time.addEvent({
            delay: Phaser.Math.Between(2000, 4000),
            callbackScope: this,
            callback: (p) => {
              // p.destroy();
              this.anims.currentAnim.resume();
              this.isMoving = false;
            },
            // args: [pointer]
          });
        }
      });


    }

  }

}

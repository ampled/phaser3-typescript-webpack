import { Enemy } from './enemy';

export class Drone extends Enemy {
  baseVel: number = 50;
  madVel: number = 70;
  vel: number = 50;
  baseAccel: number = 70;
  madAccel: number = 100;
  accel: number = 70;

  baseHealth = 6;
  health = 6;
  isFirst = true;
  canDamage = true;
  isMad = false;
  animWalk: string = 'drone';
  animMad: string = 'dronemad';

  smoke: Phaser.GameObjects.Particles.ParticleEmitter;

  isMoving = false;
  goingToPit = false;
  moveEvent: Phaser.Time.TimerEvent;

  getOutOfTopY = 60;
  getOutOfTopX1 = 300;
  getOutOfTopX2 = 100;

  constructor(
    scene,
    x,
    y,
    public dir
  ) {
    super(scene, x, y, dir, 'enemies');
  }

  firstUpdate(): void {
    this.anims.play(this.animWalk);
    this.body.setBounce(1, 1.5).setSize(16, 12).allowGravity = false;
    this.isFirst = false;
  }

  update(time: number, delta: number) {
    if (this.isFirst) {
      this.firstUpdate();
    }

    if (this.isDead) {
      return;
    }

    // always look towards player
    this.flipX = this.scene.player.x < this.x;

    // loop back around and get mad if exit through pit
    if (this.y > 240) {
      this.isMoving = false;
      this.goingToPit = false;
      this.isMad = true;
      this.smoke = this.scene.add.particles(this.x, this.y, 'projectiles', {
        name: 'smoke' + this.id,
        frame: 'smoke',
        angle: { min: -120, max: 120 },
        scale: { start: 1.5, end: 0.5 },
        alpha: { start: 1, end: 0.5 },
        lifespan: 400,
        speed: { min: 50, max: 100 },
        follow: this,
        frequency: 100,
        quantity: 3,
        blendMode: 'MULTIPLY',
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

    // exit to pit if over it
    if (this.y > 176 && this.x > 186 && this.x < 206 && !this.goingToPit) {
      this.isMoving = true;
      this.goingToPit = true;
      this.body.setVelocity(0, 5);
      this.anims && this.anims.currentAnim.resume();
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          this.scene.physics.moveTo(this, 200, 241, 20);
        },
      });
    }

    if (!this.isMoving && !this.goingToPit) {
      this.isMoving = true;

      let x = 200;
      let y = 240;
      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.scene.player.x,
        this.scene.player.y
      );
      const distanceToPit =
        Phaser.Math.Distance.Between(this.x, this.y, 120, 400) - 180;

      if (distanceToPlayer < distanceToPit && this.y < 170) {
        // go to player
        x = this.scene.player.x;
        y = this.scene.player.y - 16;
      } else {
        // go to pit
        if (this.y > 80 && this.y < 160) {
          if (this.dir !== 1) {
            x = Phaser.Math.Between(40, 60);
          } else {
            x = Phaser.Math.Between(310, 350);
          }
        }
      }
      if (
        this.y < this.getOutOfTopY &&
        this.x < this.getOutOfTopX1 &&
        this.x > this.getOutOfTopX2
      ) {
        // get out of top
        y = 40;
        if (this.dir === 1) {
          x = Phaser.Math.Between(20, 60);
        } else {
          x = Phaser.Math.Between(310, 350);
        }
      }

      this.scene.physics.accelerateTo(
        this,
        x,
        y,
        this.accel,
        this.vel,
        this.vel
      );
      // const pointer = this.scene.add.sprite(x, y, 'projectiles', 'smgproj').setTint(0);
      this.moveEvent = this.scene.time.addEvent({
        delay: Phaser.Math.Between(1500, 2000),
        callbackScope: this,
        callback: () => {
          this.setFrame(this.isMad ? 'dronemad01' : 'drone01');
          this.anims.currentAnim.pause();
          this.body
            .setAcceleration(0, 0)
            .setVelocity(this.body.velocity.x / 3, 5);
          this.scene.time.addEvent({
            delay: Phaser.Math.Between(2000, 3000),
            callbackScope: this,
            callback: (p) => {
              // p.destroy();
              this.anims.currentAnim.resume();
              this.isMoving = false;
            },
            // args: [pointer]
          });
        },
      });
    }
  }
}

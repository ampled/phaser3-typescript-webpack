import { Enemy } from './enemy_base';
import { CrateboxScene } from '../../cratebox.scene';

export class Drone extends Enemy {
  baseVel: number = 50;
  madVel: number = 70;
  vel: number = 50;
  baseAccel: number = 70;
  madAccel: number = 100;
  accel: number = 70;

  health = 8;
  isFirst = true;
  canDamage = true;
  isMad = false;
  animWalk: string = 'drone';
  animMad: string = 'dronemad';

  isMoving = false;
  moveEvent: Phaser.Time.TimerEvent;

  constructor(scene, x, y, public dir) {
    super(scene, x, y, dir, 'enemies');
  }

  firstUpdate(): void {
    this.anims.play(this.animWalk);
    // this.vel = this.dir === 1 ? -this.baseVel : this.baseVel;
    this.body.setBounce(1, 1.5).setSize(16, 12).allowGravity = false;
    // this.body.gravity = new Phaser.Math.Vector2(2, 2);
    this.isFirst = false;
    // this.scene.add.sprite(300, 60, 'projectiles', 'smgproj');
    // this.scene.add.sprite(100, 60, 'projectiles', 'smgproj');
    // this.scene.add.sprite(300, 180, 'projectiles', 'smgproj');
    // this.scene.add.sprite(100, 180, 'projectiles', 'smgproj');
  }

  update(time: number, delta: number) {
    const onFloor = this.body.onFloor() || this.body.blocked.down;
    const onCeiling = this.body.onCeiling() || this.body.blocked.up;

    if (this.isFirst) {
      this.firstUpdate();
    }
    if (this.killAt !== 0) {
      this.killAt -= delta;
      this.body.allowGravity = true;
      if (this.moveEvent && this.moveEvent.getElapsed() > 0) {
        this.moveEvent.destroy();
      }
      if (this.killAt < 0) {
        this.kill();
        return;
      }
      return;
    }
    this.flipX = this.scene.player.x < this.x;

    if (this.y > 240) {
      this.isMad = true;
      // this.scene.smokeEmitter
      //   .createEmitter({
      //     frame: 'smoke',
      //     angle: { min: -120, max: 120 },
      //     scale: { start: 1.5, end: 0.5 },
      //     alpha: { start: 1, end: .5 },
      //     lifespan: 400,
      //     speed: { min: 50, max: 100 },
      //     follow: this,
      //     frequency: 100,
      //     quantity: 3,
      //     blendMode: 'MULTIPLY'
      //   });
      this.y = -5;
      this.x = 200;
      this.health = 8;
      this.vel = this.madVel;
      this.accel = this.madAccel;
      this.scene.minishake();
      this.anims.play('dronemad');
      this.scene.events.emit('sfx', 'enemyloop');
    }

    if (!this.isMoving) {
      // console.log('y:', this.y);
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
      if (this.y < 60 && (this.x < 300 && this.x > 100)) {
        console.log('get out of top');
        y = 40;
        if (this.dir === 1) {
          x = Phaser.Math.Between(40, 60);
        } else {
          x = Phaser.Math.Between(310, 350);
        }
      }

      if (onFloor) {
        console.log('onfloor');
        y = this.y - 30;
      }
      if (onCeiling) {
        console.log('onceiling');
        y = this.y + 30;
      }

      // this.scene.physics.accelerateToObject(this, this.scene.player, 70, 50, 50);
      console.log(this.vel, this.vel);
      this.scene.physics.accelerateTo(this, x, y, this.accel, this.vel, this.vel);
      // const pointer = this.scene.add.sprite(x, y, 'projectiles', 'smgproj').setTint(0);
      this.moveEvent = this.scene.time.addEvent({
        delay: Phaser.Math.Between(500, 2000),
        callbackScope: this,
        callback: () => {
          this.anims.currentAnim.pause();
          this.body.setAcceleration(0, 0).setVelocity(0, 5);
        }
      });
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

  }

  flip(): void {
    this.body.setVelocityX(-this.body.velocity.x);
  }

}

      // this.moveTween = this.scene.tweens.add({
      //   targets: this,
      //   duration: 2000,
      //   x: this.scene.player.x,
      //   y: this.scene.player.y,
      //   callbackScope: this,
      //   onComplete() {
      //     const scene = this.scene as CrateboxScene;
      //     scene.time.addEvent({
      //       delay: 1000,
      //       callbackScope: this,
      //       callback(): void {
      //         this.isMoving = false;
      //       }
      //     });
      //   }
      // });

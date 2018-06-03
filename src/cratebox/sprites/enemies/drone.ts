import { Enemy } from './enemy_base';
import { CrateboxScene } from '../../cratebox.scene';

export class Drone extends Enemy {
  baseVel: number = 90;
  vel: number = 90;
  health = 8;
  isFirst = true;
  falling = false;
  killAt: number = 0;
  canDamage = true;
  isMad = false;

  isMoving = false;
  moveEvent: Phaser.Time.TimerEvent;

  constructor(scene, x, y, public dir) {
    super(scene, x, y, dir, 'enemies', 'drone');
  }

  firstUpdate(): void {
    this.vel = this.dir === 1 ? -this.baseVel : this.baseVel;
    this.body.allowGravity = false;
    this.isFirst = false;
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
      console.log('in pit');
      this.y = -5;
      this.x = 200;
      this.health = 8;
      this.scene.minishake();
      // this.anims.play('enemywalkmad');
      this.scene.events.emit('sfx', 'enemyloop');
    }

    if (!this.isMoving) {
      console.log(onFloor);
      // console.log('y:', this.y);
      this.isMoving = true;

      let x = 200;
      let y = 240;
      const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
      const distanceToPit = Phaser.Math.Distance.Between(this.x, this.y, 120, 400) - 150;
      // console.log('distplayer', distanceToPlayer);
      // console.log('distpit', distanceToPit);

      if (distanceToPlayer < distanceToPit && this.y < 170) {
        // console.log('go to player');
        x = this.scene.player.x;
        y = this.scene.player.y - 16;
      } else {
        // console.log('go to pit');
        if (this.y > 80 && this.y < 160) {
          if (this.dir === 1) {
            x = 30;
          } else {
            x = 370;
          }
        }
      }
      if (this.y < 60 && (this.x < 300 || this.x > 100)) {
        // console.log('get out of top');
        y = 40;
        if (this.dir === 1) {
          x = 30;
        } else {
          x = 370;
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
      this.scene.physics.accelerateTo(this, x, y, 70, 50, 50);
      const pointer = this.scene.add.sprite(x, y, 'projectiles', 'smgproj');
      this.moveEvent = this.scene.time.addEvent({
        delay: 2000,
        callbackScope: this,
        callback: (p) => {
          p.destroy();
          this.body.setAcceleration(0, 0).setVelocity(0, 5);
        },
        args: [pointer]
      });
      this.scene.time.addEvent({
        delay: 2500,
        callbackScope: this,
        callback: () => {
          this.isMoving = false;
        }
      });

    }

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

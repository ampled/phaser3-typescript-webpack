import { Enemy } from './enemy';
import * as constants from '../../constants';
import { CrateboxScene } from 'cratebox/cratebox.scene';

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
  tween: Phaser.Tweens.Tween;

  constructor(
    scene: CrateboxScene,
    x: number,
    y: number,
    public dir: 1 | -1
  ) {
    super(scene, x, y, dir, 'enemies');
  }

  firstUpdate(): void {
    this.anims.play(this.animWalk);
    this.body.setBounce(0.8, 0.8).setSize(16, 12).allowGravity = false;
    // this.body.setGravityY(-590);
    // console.log('add tween!!');
    this.setOrigin(0.5, 0);

    this.tween = this.scene.tweens.addCounter({
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        const value = tween.getValue();
        const originY = value / 1.5;
        this.setOrigin(0.5, originY);
      },
    });

    // this.scene.add.tween({
    //   targets: [this],
    //   yoyo: true,
    //   loop: -1,
    //   scaleY: 0.9,
    //   duration: 1000,
    //   ease: Phaser.Math.Easing.Sine.InOut,
    //   onActive: () => {
    //     console.log('tween active!!!');
    //   },
    //   onUpdate: (tween) => {
    //     console.log(tween.getValue());
    //   },
    // });
    this.isFirst = false;
  }

  MOVE_INTERVAL = { min: 1000, max: 2000 } as const;
  MOVE_DURATION = { min: 2001, max: 3000 } as const;

  getNextArea(currentArea: string) {
    let nextArea = 'spawn';
    switch (currentArea) {
      case 'spawn':
        if (this.dir === 1) {
          nextArea = 'topright';
        } else {
          nextArea = 'topleft';
        }
        break;
      case 'topright':
      case 'topleft':
        nextArea = 'center';
        break;
      case 'center':
        if (this.dir === 1) {
          nextArea = 'bottomright';
        } else {
          nextArea = 'bottomleft';
        }
        break;
      case 'bottomright':
      case 'bottomleft':
        nextArea = 'underbridge';
        break;
      default:
        nextArea = 'spawn';
        break;
    }

    return this.scene.mapAreas.children
      .getArray()
      .find((area) => area.getData('area') === nextArea) as Phaser.GameObjects.Rectangle;
  }

  update() {
    if (this.isFirst) {
      this.firstUpdate();
    }

    if (this.isDead) {
      return;
    }

    this.flipX = this.scene.player.x < this.x;
    const player = this.scene.player;
    if (this.y > constants.MAPHEIGHT) {
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
      this.y = 0;
      this.x = constants.MAPCENTERX;
      this.health = this.baseHealth;
      this.vel = this.madVel;
      this.accel = this.madAccel;
      this.scene.minishake();
      this.anims.play('dronemad');
      this.scene.events.emit('sfx', 'enemyloop');
    }

    if (this.body.onFloor()) {
      this.body.setAccelerationY(-20);
    }

    if (!this.isMoving) {
      this.isMoving = true;

      const moveDelay = Phaser.Math.Between(this.MOVE_INTERVAL.min, this.MOVE_INTERVAL.max);

      this.scene.time.addEvent({
        delay: moveDelay,
        callback: () => {
          if (this.isDead) return;
          // console.log('move action');
          this.anims.play({
            key: this.anims.currentAnim.key,
            frameRate: 12,
          });
          const sightCheck = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);
          const tilesBetweenDroneAndPlayer = this.scene.map.getTilesWithinShape(sightCheck, { isColliding: true });
          // console.log('tiles:', tilesBetweenDroneAndPlayer);
          if (tilesBetweenDroneAndPlayer.length === 0) {
            // console.log('get player!!');
            this.scene.physics.accelerateTo(this, player.x, player.y, 100, 500, 500);
          } else {
            let areaName = '';
            this.scene.physics.overlap(this, this.scene.mapAreas, (_, area) => {
              areaName = (<Phaser.GameObjects.GameObject>area).getData('area');
            });

            if (areaName === 'underbridge') {
              this.scene.physics.moveTo(this, constants.MAPCENTERX, constants.MAPHEIGHT + 10);
            } else {
              const nextArea = this.getNextArea(areaName);
              // console.log('nextArea:', nextArea.getData('area'));
              if (nextArea) {
                const pmX = nextArea.width / 3;
                const x = Phaser.Math.Between(nextArea.x + pmX, nextArea.x + nextArea.width - pmX);
                const pmY = nextArea.height / 3;
                const y = Phaser.Math.Between(nextArea.y + pmY, nextArea.y + nextArea.height - pmY);
                this.scene.physics.accelerateTo(this, x, y);
              }
            }
          }
        },
      });

      const moveDuration = moveDelay + Phaser.Math.Between(this.MOVE_DURATION.min, this.MOVE_DURATION.max);

      this.scene.time.addEvent({
        delay: moveDuration,
        callback: () => {
          if (this.isDead) return;
          // console.log('stop moving!!');

          this.anims.play({
            key: this.anims.currentAnim.key,
            frameRate: 3,
          });
          this.body.setAcceleration(0, 0).setVelocity(this.body.velocity.x / 3, 5);
          this.isMoving = false;
        },
      });
    }

    // if (this.isMoving) {}
  }

  update$(time: number, delta: number) {
    if (this.isFirst) {
      this.firstUpdate();
    }

    if (this.isDead) {
      return;
    }

    // always look towards player
    this.flipX = this.scene.player.x < this.x;

    // loop back around and get mad if exit through pit
    if (this.y > constants.MAPHEIGHT) {
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
      this.y = 0;
      this.x = constants.MAPCENTERX;
      this.health = this.baseHealth;
      this.vel = this.madVel;
      this.accel = this.madAccel;
      this.scene.minishake();
      this.anims.play('dronemad');
      this.scene.events.emit('sfx', 'enemyloop');
    }

    // exit to pit if over it
    if (this.y > 350 && this.x > 186 && this.x < 206 && !this.goingToPit) {
      this.isMoving = true;
      this.goingToPit = true;
      this.body.setVelocity(0, 5);
      this.anims && this.anims.currentAnim.resume();
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          // console.log('go to pit!');
          if (this.isDead) return;
          this.scene.physics.moveTo(this, constants.MAPCENTERX, constants.MAPHEIGHT + 1, 20);
        },
      });
    }

    if (!this.isMoving && !this.goingToPit) {
      this.isMoving = true;

      let x = constants.MAPCENTERX;
      let y = constants.MAPCENTERY;
      const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
      const distanceToPit = Phaser.Math.Distance.Between(this.x, this.y, constants.MAPCENTERX, constants.MAPHEIGHT);

      if (distanceToPlayer < distanceToPit && this.y < 340) {
        // go to player
        // console.log('go to player');
        x = this.scene.player.x;
        y = this.scene.player.y - 16;
      } else {
        // go to pit
        console.log('go to pit');
        if (this.y > 80 * 2 && this.y < 160 * 2) {
          if (this.dir !== 1) {
            x = Phaser.Math.Between(40, 60);
          } else {
            x = Phaser.Math.Between(310, 350);
          }
        }
      }

      // Phaser.Geom.Intersects.RectangleToRectangle(this.body.getBounds(), this.scene.spawnArea)
      // this.body.
      const checkRect = this.scene.add.rectangle(this.x, this.y, 16, 16, 0xff0000, 0.5).setOrigin(0, 0);
      const rect = new Phaser.Geom.Rectangle(this.x, this.y, 16, 16);

      // const inSpawn = Phaser.Geom.Intersects.RectangleToRectangle(this.scene.spawnAreaRect, rect);
      let areaName = '';
      const inSpawn = this.scene.physics.overlap(this, this.scene.spawnArea);
      this.scene.physics.overlap(this, this.scene.mapAreas, (_, area) => {
        areaName = (<Phaser.GameObjects.GameObject>area).getData('area');
        console.log(areaName);
      });

      if (areaName === 'spawnhole') {
        console.log('go to spawnarea');
        y = Phaser.Math.Between(50, 120);
        if (this.dir === 1) {
          x = Phaser.Math.Between(500, 530);
        } else {
          x = Phaser.Math.Between(270, 300);
        }
      } else if (areaName === 'spawn') {
        // get out of top
        console.log('get out of top');
        y = Phaser.Math.Between(80, 200);
        if (this.dir === 1) {
          x = Phaser.Math.Between(90, 200);
        } else {
          x = Phaser.Math.Between(590, 700);
        }
      } else if (areaName === 'topleft' || areaName === 'topright') {
        console.log('get out of ' + areaName);
        y = Phaser.Math.Between(190, 300);
        x = Phaser.Math.Between(280, 540);
      } else if (areaName) {
        //
      }
      this.scene.physics.accelerateTo(this, x, y, this.accel, this.vel, this.vel);
      const pointer = this.scene.add.sprite(x, y, 'projectiles', 'smgproj').setTint(0);
      this.moveEvent = this.scene.time.addEvent({
        delay: Phaser.Math.Between(1500, 2000),
        callbackScope: this,
        callback: () => {
          console.log('move!');
          this.setFrame(this.isMad ? 'dronemad01' : 'drone01');
          this.anims.currentAnim.pause();
          this.body.setAcceleration(0, 0).setVelocity(this.body.velocity.x / 3, 5);
          this.scene.time.addEvent({
            delay: Phaser.Math.Between(2000, 3000),
            callbackScope: this,
            callback: (p) => {
              console.log('stop move');
              p.destroy();
              checkRect.destroy();
              if (this.isDead) return;
              this.anims.currentAnim.resume();
              this.isMoving = false;
            },
            args: [pointer],
          });
        },
      });
    }
  }
}

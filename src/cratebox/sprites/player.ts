import * as constants from 'cratebox/constants';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import { Gun, GunFactory } from 'cratebox/sprites/guns';

export class Player extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;
  scene: CrateboxScene;

  // input keys
  keys: { [key: string]: Phaser.Input.Keyboard.Key };
  inputs: { [key: string]: boolean };

  gun: Gun;

  // factors
  runSpeed = 180;
  knockback = 0;

  // timers
  jumpTimer = 0;
  shootTimer = 0;
  walkSfxTimer = 0;

  // states
  isShooting = false;
  isJumping = false;
  isFalling = false;

  constructor(scene: any, x: number, y: number, key: string, layer: Phaser.Tilemaps.TilemapLayer) {
    super(scene, x, y, key);
    console.log('scene', scene);
    console.log('scene.keys:', scene.keys);
    this.keys = this.scene.keys;
    this.scene.physics.world.enable(this);
    this.scene.physics.add.collider(this, layer);
    // this.setDisplaySize(16, 16);
    this.body.setSize(16, 16);
    this.setOrigin(0.5, 1);
    this.body.setOffset(0, 0);
    this.body.setCollideWorldBounds(false);
    this.setOriginFromFrame();
    // this.setOrigin(0.5, 1);
    this.setDepth(10);
    this.resetGun(x, y);
  }

  update(time: number, delta: number): void {
    this.inputs = {
      left: this.keys.left.isDown || this.scene.touchControls?.left,
      right: this.keys.right.isDown || this.scene.touchControls?.right,
      jump: this.keys.up.isDown || this.keys.space.isDown || this.scene.touchControls?.up,
      shoot: this.keys.down.isDown || this.keys.X.isDown || this.scene.touchControls?.shoot,
    };
    if (this.y > constants.MAPHEIGHT) {
      this.scene.restart();
      return;
    }

    if (this.body.onFloor() && this.isFalling) {
      this.isFalling = false;
      this.scene.events.emit('sfx', 'foley');
    }
    this.isFalling = this.body.velocity.y > 50;

    this.updateGun(time, delta);
    this.animation();
    this.controls(delta);

    this.shootTimer += delta;
    this.walkSfxTimer += delta;
  }

  resetGun(x, y): void {
    if (this.gun) {
      this.gun.preDestroy();
      this.gun.destroy();
    }
    this.gun = GunFactory.createDefaultGun(this.scene, x + 8, y);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this.gun);
  }

  updateGun(time: number, delta: number): void {
    this.gun.update(time, delta);
  }

  changeGun(): void {
    this.gun.destroy();
    this.gun = GunFactory.createRandomGun(this.scene, this.x, this.y);
    this.scene.add.existing(this.gun);
    this.scene.flashGunName(this.gun.id);
  }

  nextGun(): void {
    this.gun.destroy();
    this.gun = GunFactory.getNextGun(this.scene, this.x, this.y, this.gun);
    this.scene.add.existing(this.gun);
    this.scene.flashGunName(this.gun.id);
  }

  controls(delta: number): void {
    if (this.inputs.shoot) {
      if (this.gun.shootTimer > this.gun.cooldown) {
        this.knockback = this.shoot();
        if (!this.knockback) {
          this.knockback = 0;
        }
      }
    } else {
      this.gun.unShoot();
      this.knockback = 0;
    }

    if (this.inputs.left && !this.inputs.right) {
      this.body.setVelocityX(-this.runSpeed + this.knockback);
      if (this.walkSfxTimer > 150 && this.body.onFloor()) {
        this.walkSfx();
      }
      this.flipX = true;
    } else if (this.inputs.right && !this.inputs.left) {
      this.body.setVelocityX(this.runSpeed + this.knockback);
      if (this.walkSfxTimer > 150 && this.body.onFloor()) {
        this.walkSfx();
      }
      this.flipX = false;
    } else {
      this.body.setVelocityX(this.knockback);
    }

    if (this.inputs.jump) {
      if (this.body.onFloor() && this.jumpTimer === 0) {
        this.jumpTimer = 1;
        this.body.setVelocityY(-300);
        this.scene.events.emit('sfx', 'jump');
      } else if (this.jumpTimer > 0 && this.jumpTimer < 301 && !this.body.onCeiling()) {
        this.jumpTimer += delta;
        this.body.setVelocityY(-300);
      } else if (this.body.onCeiling()) {
        this.scene.events.emit('sfx', 'foley');
        this.jumpTimer = 301;
      }
    } else {
      this.jumpTimer = 0;
    }
  }

  jump(): void {
    if (this.body.onFloor() && this.jumpTimer === 0) {
      this.jumpTimer = 1;
      this.body.setVelocityY(-150);
    }
  }

  animation(): void {
    let anim: string;
    let repeatDelay = 0;
    if (this.body.velocity.y !== 0 || !this.body.onFloor()) {
      anim = 'cube-jump';
      repeatDelay = 0;
    } else if (this.body.velocity.x !== 0 && (this.inputs.left || this.inputs.right)) {
      anim = 'cube-run';
    } else {
      anim = 'cube-idle';
    }

    // this.play(anim, true);
    this.play({ key: anim, repeatDelay }, true);
  }

  shoot(): number {
    // this.scene.tweens.add({
    //   targets: this,
    //   duration: 20,
    //   displayOriginX: this.flipX ? this.displayOriginX - 1 : this.displayOriginX + 1,
    //   yoyo: true,
    //   onComplete: () => {
    //     this.setScale(1, 1);
    //     this.setDisplayOrigin(0, 0);
    //   }
    // });
    return this.gun.shoot();
  }

  walkSfx(): void {
    if (this.body.onFloor()) {
      this.scene.events.emit('sfx', 'walk');
      this.walkSfxTimer = 0;
    }
  }
}

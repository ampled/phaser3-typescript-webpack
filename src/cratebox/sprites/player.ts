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
  runSpeed = 100;
  knockback = 0;

  // timers
  jumpTimer = 0;
  shootTimer = 0;
  walkSfxTimer = 0;

  // states
  isShooting = false;
  isJumping = false;
  isFalling = false;

  constructor(scene, x, y, key, layer) {
    super(scene, x, y, key);
    this.keys = this.scene.keys;
    this.scene.physics.world.enable(this);
    this.scene.physics.add.collider(this, layer);
    this.body.setSize(11, 16).setCollideWorldBounds(false);
    this.setDepth(10);
    this.resetGun(x, y);
  }

  update(time: number, delta: number): void {

    this.inputs = {
      left: this.keys.left.isDown || this.scene.touchControls.left,
      right: this.keys.right.isDown || this.scene.touchControls.right,
      jump: this.keys.up.isDown || this.keys.space.isDown || this.scene.touchControls.up,
      shoot: this.keys.down.isDown || this.keys.X.isDown || this.scene.touchControls.shoot
    };
    if (this.y > 400) {
      this.scene.restart();
      return;
    }

    if (this.body.onFloor() && this.isFalling) {
      this.isFalling = false;
      this.scene.events.emit('sfx', 'foley');
    }
    this.isFalling = this.body.velocity.y > 50;

    this.updateGun(time, delta);
    this.animation(time, delta);
    this.controls(time, delta);

    this.body.setFrictionY(1000);

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

  updateGun(time, delta): void {
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

  controls(time: number, delta: number): void {
    if (this.inputs.shoot) {
      if (this.gun.shootTimer > this.gun.cooldown) {
        this.knockback = this.shoot();
        if (!this.knockback) {
          this.knockback = 0;
        }
      }
    } else {
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
        this.body.setVelocityY(-150);
        this.scene.events.emit('sfx', 'jump');
      } else if (this.jumpTimer > 0 && this.jumpTimer < 301 && !this.body.onCeiling()) {
        this.jumpTimer += delta;
        this.body.setVelocityY(-150);
      } else if (this.body.onCeiling()) {
        this.scene.events.emit('sfx', 'foley');
        this.jumpTimer = 301;
      }
    } else {
      this.jumpTimer = 0;
    }

  }

  animation(time: number, delta: number): void {
    let anim: string;
    if (this.body.velocity.y !== 0) {
      anim = 'jump';
    } else if (this.isShooting) {
      anim = 'shoot';
    } else if (this.body.velocity.x !== 0 && (this.inputs.left || this.inputs.right)) {
      anim = 'run';
    } else {
      anim = 'stand';
    }
    if (this.anims.getCurrentKey() !== anim) {
      this.anims.play(anim);
    }
  }

  shoot(): number {
    this.scene.tweens.add({
      targets: this,
      duration: 20,
      // scaleY: .9,
      displayOriginX: this.flipX ? this.displayOriginX - 1 : this.displayOriginX + 1,
      // displayOriginY: this.displayOriginY - 1,
      yoyo: true,
      onComplete: () => {
        this.setScale(1, 1);
      }
    });
    return this.gun.shoot();
  }

  walkSfx(): void {
    if (this.body.onFloor()) {
      this.scene.events.emit('sfx', 'walk');
      this.walkSfxTimer = 0;
    }
  }

}

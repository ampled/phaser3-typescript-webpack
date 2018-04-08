import { CrateboxScene } from 'cratebox/cratebox.scene';
import { Gun, GunFactory } from 'cratebox/sprites/guns';

export class Player extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;
  scene: CrateboxScene;

  // input keys
  keys: { [key: string]: Phaser.Input.Keyboard.Key };

  gun: Gun;

  // factors
  runSpeed = 100;

  // timers
  jumpTimer = 0;
  shootTimer = 0;
  walkSfxTimer = 0;

  // states
  isShooting = false;
  isJumping = false;
  isFalling = false;

  // scene group references
  projectiles: Phaser.GameObjects.Group;

  constructor(scene, x, y, key, layer) {
    super(scene, x, y, key);
    this.keys = this.scene.keys;
    this.scene.physics.world.enable(this);
    this.scene.physics.add.collider(this as any, layer);
    this.body.setSize(11, 16).setCollideWorldBounds(false);
    this.setDepth(10);
    this.projectiles = this.scene.projectileGroup;
    this.resetGun(x, y);
  }

  update(time: number, delta: number): void {
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
    this.scene.flashGunName(this.gun.name);
  }

  controls(time: number, delta: number): void {

    if (this.keys.left.isDown && !this.keys.right.isDown) {
      this.body.setVelocityX(-this.runSpeed);
      if (this.walkSfxTimer > 150 && this.body.onFloor()) {
        this.walkSfx();
      }
      this.flipX = true;
    } else if (this.keys.right.isDown && !this.keys.left.isDown) {
      this.body.setVelocityX(this.runSpeed);
      if (this.walkSfxTimer > 150 && this.body.onFloor()) {
        this.walkSfx();
      }
      this.flipX = false;
    } else {
      this.body.setVelocityX(0);
    }

    if (this.keys.up.isDown || this.keys.space.isDown) {
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

    if (this.keys.X.isDown || this.keys.down.isDown) {
      if (this.gun.shootTimer > this.gun.cooldown) {
        this.gun.shoot();
      }
    }
  }

  animation(time: number, delta: number): void {
    let anim: string;
    if (this.body.velocity.y !== 0) {
      anim = 'jump';
    } else if (this.isShooting) {
      anim = 'shoot';
    } else if (this.body.velocity.x !== 0 && this.keys.left.isDown || this.keys.right.isDown) {
      anim = 'run';
    } else {
      anim = 'stand';
    }
    if (this.anims.getCurrentKey() !== anim) {
      this.anims.play(anim);
    }
  }

  shoot(): void {
    this.gun.shoot();
  }

  walkSfx(): void {
    if (this.body.onFloor()) {
      this.scene.events.emit('sfx', 'walk');
      this.walkSfxTimer = 0;
    }
  }

}

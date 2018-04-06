import { CrateboxScene } from 'cratebox/cratebox.scene';
import { GunConfig, guns } from 'cratebox/guns';

export class Player extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;
  scene: CrateboxScene;

  keys: { [key: string]: Phaser.Input.Keyboard.Key };
  gun = guns[0];
  gunSprite: Phaser.GameObjects.Sprite;
  gunBody: Phaser.Physics.Arcade.Body;

  // factors
  runSpeed = 100;

  // timers
  jumpTimer = 0;
  shootTimer = 0;

  // states
  isShooting = false;
  isJumping = false;
  isFalling = false;

  // groups
  projectiles: Phaser.GameObjects.Group;

  constructor(scene, x, y, key, layer) {
    super(scene, x, y, key);
    this.keys = this.scene.keys;
    this.gun = guns[0];
    this.gunSprite = this.scene.add.sprite(this.x, this.y, this.gun.key);
    this.shootTimer = this.gun.cooldown; // allow player to shoot immediately
    this.scene.physics.world.enable(this);
    this.scene.physics.world.enable(this.gunSprite);
    this.gunBody = this.gunSprite.body as any;
    this.gunBody.setSize(10, 10).allowGravity = false;

    this.scene.physics.add.collider(this as any, layer);
    this.body.setSize(11, 16).setCollideWorldBounds(false);
    this.setDepth(10);
    this.projectiles = this.scene.projectileGroup;
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
    this.controls(time, delta);
    this.animation(time, delta);

    this.shootTimer += delta;

  }

  updateGun(time, delta): void {
    this.gunSprite.x = this.flipX ? this.x - 8 : this.x + 8;
    this.gunSprite.y = this.y;
    this.gunSprite.flipX = this.flipX;
    if (this.gunSprite.flipX) {
      this.gunSprite.setDepth(11);
    } else {
      this.gunSprite.setDepth(9);
    }
    if (this.shootTimer > this.gun.cooldown / 2) {
      this.gunBody.setAngularVelocity(0);
      this.gunSprite.setAngle(0);
    }
  }

  controls(time: number, delta: number): void {
    if (this.keys.X.isDown) {
      if (this.shootTimer > this.gun.cooldown) {
        this.shoot();
      }
    }
    if (this.keys.left.isDown && !this.keys.right.isDown) {
      this.body.setVelocityX(-this.runSpeed);
      this.flipX = true;
    } else if (this.keys.right.isDown && !this.keys.left.isDown) {
      this.body.setVelocityX(this.runSpeed);
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
  }

  animation(time: number, delta: number): void {
    let anim: string;

    if (this.body.velocity.y !== 0) {
      anim = 'jump';
    } else if (this.isShooting) {
      anim = 'shoot';
    } else if (this.body.velocity.x !== 0) {
      anim = 'run';
    } else {
      anim = 'stand';
    }

    if (this.anims.getCurrentKey() !== anim) {
      this.anims.play(anim);
    }

  }

  shoot(): void {
    this.scene.events.emit('sfx', 'shoot');

    const newProjectile = this.projectiles.create(this.gunSprite.x, this.gunSprite.y, this.gun.projectile.key);
    const newProjectileBody: Phaser.Physics.Arcade.Body = newProjectile.body as any;
    newProjectileBody
      .setVelocityX(this.flipX ? -this.gun.projectile.velocity : this.gun.projectile.velocity)
      .setSize(this.gun.projectile.size, this.gun.projectile.size)
      .allowGravity = this.gun.projectile.gravity;
    // this.gunSprite.setAngle(this.gunSprite.flipX ? this.gun.recoilAmount : -this.gun.recoilAmount);
    this.gunBody.setAngularVelocity(this.gunSprite.flipX ? this.gun.recoilAmount : -this.gun.recoilAmount);
    this.shootTimer = 0;
  }

}

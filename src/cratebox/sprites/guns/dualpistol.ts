import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import { Pistol } from './pistol';

export class DualPistol extends Pistol implements GunProps {
  static id = 'DUALS';
  id = 'DUALS';

  cooldown = 200;
  shootTimer = 200;
  recoil = 200;
  damage = 3;
  size = 10;

  // projectile: ProjectileConfig = {
  //   velocity: 600,
  //   size: 10,
  //   gravity: false,
  //   key: 'projectile'
  // };

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'dualgun') {
    super(scene, x, y, key, frame);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.scene.player.x;
    this.y = this.scene.player.y;
    // this.flipX = this.scene.player.flipX;
    this.setDepth(9);
    this.shootTimer += delta;
  }

  shoot(shake = false) {
    if (this.canShoot) {
      if (shake) {
        this.scene.minishake();
      }

      const x1 = this.x + 16;
      const x2 = this.x - 16;

      this.canShoot = false;
      this.released = false;
      this.scene.events.emit('sfx', this.sfx, Phaser.Math.FloatBetween(0.7, 1.1));

      const projectile = this.scene.projectileGroup
        .create(x1, this.y, 'projectiles', this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

      projectile.anims.play(this.projectile.anim);

      const projectile2 = this.scene.projectileGroup
        .create(x2, this.y, 'projectiles', this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

      projectile2.anims.play(this.projectile.anim);

      projectile2.body.setVelocityX(-this.projectile.velocity).setSize(this.projectile.size, this.projectile.size).allowGravity =
        this.projectile.gravity;

      projectile.body.setVelocityX(this.projectile.velocity).setSize(this.projectile.size, this.projectile.size).allowGravity =
        this.projectile.gravity;

      this.scene.time.addEvent({
        delay: this.cooldown,
        callbackScope: this,
        callback() {
          if (this.active && this.released) {
            this.canShoot = true;
          }
        },
      });

      this.scene.tweens.add({
        targets: this,
        duration: 48,
        ease: 'Sine.easeIn',
        yoyo: true,
        angle: this.flipX ? 10 : -10,
        callbackScope: this,
        onComplete() {
          this.setAngle(0);
        },
      });

      // this.body.setAngularVelocity(this.flipX ? this.recoil : -this.recoil);
      this.shootTimer = 0;
    } else {
      this.scene.time.addEvent({
        delay: this.cooldown,
        callbackScope: this,
        callback() {
          if (this.active && this.released) {
            this.canShoot = true;
          }
        },
      });
    }
    return 0;
  }

  projectileCollide = (projectile, scene) => {
    scene.events.emit('sfx', 'foley');
    projectile.destroy();
  };
}

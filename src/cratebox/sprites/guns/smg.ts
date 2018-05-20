import { Pistol } from 'cratebox/sprites/guns/pistol';
import { GunProps } from 'cratebox/sprites/guns/gun';

export class Smg extends Pistol implements GunProps {
  static id = 'SMG';
  id = 'SMG';
  sfx = 'enemyshot';
  sfxRate = 2;

  cooldown = 75;
  shootTimer = 75;
  recoil = 30;
  damage = 2;
  pushBackFloor = 40;
  pushBackAir = 60;
  angleSpread = 25;

  projectile = {
    velocity: 400,
    size: 5,
    gravity: false,
    key: 'smgproj'
  };

  constructor(scene, x, y, key = 'guns', frame = 'smg') {
    super(scene, x, y, key, frame);
  }

  shoot(): number {
    this.scene.events.emit('sfx', this.sfx, this.sfxRate);
    const projectile =
      this.scene.projectileGroup.create(this.x, this.y, 'projectiles', this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide);

    projectile.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setVelocityY(Phaser.Math.Between(-this.angleSpread, this.angleSpread))
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;
    this.scene.tweens.add({
      targets: this,
      duration: this.cooldown / 2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      angle: this.flipX ? this.recoil : -this.recoil,
    });
    this.shootTimer = 0;
    if (this.scene.player.body.onFloor()) {
      // this.scene.player.x += this.flipX ? 1 : -1;
      // this.scene.player.body.setVelocityX(this.flipX ? this.pushBackFloor : -this.pushBackFloor);
      if (this.flipX) {
        return this.pushBackFloor;
      } else {
        return -this.pushBackFloor;
      }
      // this.scene.player.body.set
    } else {
      if (this.flipX) {
        return this.pushBackAir;
      } else {
        return -this.pushBackAir;
      }
    }
  }

}

import { Pistol } from 'cratebox/sprites/guns/pistol';
import { GunProps } from 'cratebox/sprites/guns/gun';

export class Smg extends Pistol implements GunProps {
  name = '    S M G';
  sfx = 'enemyshot';

  cooldown = 75;
  shootTimer = 75;
  recoil = 1000;
  damage = 2;
  pushBackFloor = 100;
  pushBackAir = 300;
  angleSpread = 25;

  projectile = {
    velocity: 400,
    size: 5,
    gravity: false,
    key: 'smgproj'
  };

  constructor(scene, x, y, key = 'smg') {
    super(scene, x, y, key);
  }

  shoot(): void {
    this.scene.events.emit('sfx', this.sfx);
    const projectile =
      this.scene.projectileGroup.create(this.x, this.y, this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide);

    projectile.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setVelocityY(Phaser.Math.Between(-this.angleSpread, this.angleSpread))
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;
    this.body.setAngularVelocity(this.flipX ? this.recoil : -this.recoil);
    this.shootTimer = 0;
    if (this.scene.player.body.onFloor()) {
      // this.scene.player.x += this.flipX ? 1 : -1;
      this.scene.player.body.setVelocityX(this.flipX ? this.pushBackFloor : -this.pushBackFloor);
      // this.scene.player.body.set
    } else {
      this.scene.player.body.setVelocityX(this.flipX ? this.pushBackAir : -this.pushBackAir);
    }
  }

}

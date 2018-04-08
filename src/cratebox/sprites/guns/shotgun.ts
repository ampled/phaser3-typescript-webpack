import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';

export class Shotgun extends Gun implements GunProps {
  name = 'S H O T G U N';
  sfx = 'death';

  cooldown = 650;
  shootTimer = 650;
  recoil = 800;
  damage = 1.5;
  size = 10;

  projectile: ProjectileConfig = {
    velocity: 900,
    amount: 6,
    size: 2,
    gravity: false,
    key: 'shotgunproj'
  };

  projectileTimer = 0;
  projectileRef: Phaser.GameObjects.GameObject;
  projRef: Phaser.GameObjects.GameObject[] = [];

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'shotgun') {
    super(scene, x, y, key);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x - 8 : this.scene.player.x + 8;
    this.y = this.scene.player.y;
    this.flipX = this.scene.player.flipX;
    this.setDepth(this.flipX ? 11 : 9);
    if (this.shootTimer > this.cooldown / 5) {
      this.body.setAngularVelocity(0);
      this.setAngle(0);
    }
    this.shootTimer += delta;
    this.projectileTimer += delta;

    if (this.projectileTimer > 270) {
      this.projRef.forEach(proj => proj.destroy());
    }
  }

  shoot(): void {
    this.scene.events.emit('sfx', this.sfx);
    this.scene.minishake();
    this.projRef =
      this.scene.projectileGroup
        .createMultiple({
          key: this.projectile.key,
          repeat: this.projectile.amount,
          setXY: { x: this.x, y: this.y }
        } as any);
    this.projRef.forEach(proj => {
      proj.body
        .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
        .setVelocityY(Phaser.Math.Between(-150, 120))
        .setSize(this.projectile.size, this.projectile.size)
        .setAccelerationX(this.flipX ? 3570 : -3570)
        // .setAccelerationX(this.flipX ? 300 : -300)
        .allowGravity = this.projectile.gravity;
    });
    this.projRef.forEach(proj =>
      proj.setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide)
        .setData('force', 4)
    );
    this.body.setAngularVelocity(this.flipX ? this.recoil : -this.recoil);
    this.shootTimer = 0;
    this.projectileTimer = 0;
  }

  projectileCollide = (projectile, scene) => {
    // scene.events.emit('sfx', 'enemyshot');
    projectile.destroy();
  }

}

import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';

export class Pistol extends Gun implements GunProps {
  static id = 'PISTOL';
  id = 'PISTOL';
  sfx = 'shoot';

  cooldown = 300;
  shootTimer = 300;
  recoil = 200;
  damage = 3;
  size = 10;

  projectile: ProjectileConfig = {
    velocity: 600,
    size: 10,
    gravity: false,
    key: 'projectile'
  };

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'gun') {
    super(scene, x, y, key, frame);
    // this.scene.physics.world.enable(this);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x - 8 : this.scene.player.x + 8;
    this.y = this.scene.player.y;
    this.flipX = this.scene.player.flipX;
    this.setDepth(this.flipX ? 11 : 9);
    this.shootTimer += delta;
  }

  shoot() {
    this.scene.events.emit('sfx', this.sfx);
    const projectile =
      this.scene.projectileGroup.create(this.x, this.y, 'projectiles', 'smgproj')
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide);

    projectile.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;

    this.scene.tweens.add({
      targets: this,
      duration: 150,
      ease: 'Sine.easeIn',
      yoyo: true,
      angle: this.flipX ? 70 : -70,
    });

    // this.body.setAngularVelocity(this.flipX ? this.recoil : -this.recoil);
    this.shootTimer = 0;
    return 0;
  }

  projectileCollide = (projectile, scene) => {
    scene.events.emit('sfx', 'foley');
    projectile.destroy();
  }

}

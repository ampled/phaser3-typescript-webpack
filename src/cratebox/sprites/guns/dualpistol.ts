import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import ABody = Phaser.Physics.Arcade.Body;


export class DualPistol extends Gun implements GunProps {
  name = '  D U A L S';
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

  constructor(scene, x, y, key = 'guns', frame = 'dualgun') {
    super(scene, x, y, key, frame);
    // this.scene.physics.world.enable(this);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x : this.scene.player.x;
    this.y = this.scene.player.y;
    this.flipX = this.scene.player.flipX;
    this.setDepth(9);
    this.shootTimer += delta;
  }

  shoot() {
    this.scene.events.emit('sfx', this.sfx);
    const projectile =
      this.scene.projectileGroup.create(this.x + 16, this.y, this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide);

    const projectile2 =
      this.scene.projectileGroup.create(this.x - 16, this.y, this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide);

    (<ABody>projectile.body)
      .setVelocityX(this.projectile.velocity)
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;

    (<ABody>projectile2.body)
      .setVelocityX(-this.projectile.velocity)
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;

    this.shootTimer = 0;
    return 0;
  }

  projectileCollide = (projectile, scene) => {
    scene.events.emit('sfx', 'foley');
    projectile.destroy();
  }

}

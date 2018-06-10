import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import Sprite = Phaser.GameObjects.Sprite;
import { LaserBeam } from './laserbeam';

export class LaserGun extends Gun implements GunProps {
  static id = 'LASERGUN';
  id = 'LASERGUN';
  sfx = 'laser1';
  sfxRate = 1;

  cooldown = 1500;
  recoil = 200;
  damage = 12;
  size = 10;

  shootTimer = 1201;

  projectile: ProjectileConfig = {
    velocity: 50,
    size: 5,
    gravity: false,
    key: 'rocket'
  };

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'lasergun') {
    super(scene, x, y, key, frame);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x - 8 : this.scene.player.x + 8;
    this.y = this.scene.player.y;
    this.flipX = this.scene.player.flipX;
    this.setDepth(this.flipX ? 11 : 9);
    if (this.shootTimer > this.cooldown / 2) {
      this.body.setAngularVelocity(0);
      this.setAngle(0);
    }

    this.shootTimer += delta;
  }

  shoot() {
    this.shootTimer = 0;
    this.scene.events.emit('sfx', this.sfx, this.sfxRate);

    const beam = new LaserBeam(this.scene, this.x, this.y)
      .setData('dmg', this.damage)
      .setData('melee', true);

    beam.body.allowGravity = false;

    this.scene.projectileGroup.add(beam, true);

    return 0;
  }

  // projectileCollide = (projectile, scene) => {
  //   this.explode(projectile, undefined, scene);
  // }

  // enemyCollide = (projectile, enemy, scene?) => {
  //   this.explode(projectile, enemy, scene);
  // }

}

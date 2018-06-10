import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import { Pistol } from './pistol';

export class Revolver extends Pistol implements GunProps {
  static id = 'REVOLVER';
  id = 'REVOLVER';
  sfx = 'revolvershoot';

  cooldown = 280;
  shootTimer = 280;
  recoil = 200;
  damage = 6;
  size = 10;

  projectile: ProjectileConfig = {
    velocity: 1000,
    size: 10,
    gravity: false,
    key: 'smgproj',
    anim: 'projectilefast'
  };

  constructor(scene, x, y, key = 'guns', frame = 'revolver') {
    super(scene, x, y, key, frame);
  }

  shoot(): number {
    return super.shoot(true);
  }

}

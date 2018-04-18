import { Smg } from 'cratebox/sprites/guns/smg';
import { GunProps } from 'cratebox/sprites/guns/gun';

export class Minigun extends Smg implements GunProps {
  name = 'M I N I G U N';
  sfx = 'enemyshot';

  cooldown = 40;
  shootTimer = 30;
  recoil = 0;
  damage = 1.2;
  pushBackFloor = 90;
  pushBackAir = 150;
  angleSpread = 150;

  projectile = {
    velocity: 500,
    size: 5,
    gravity: false,
    key: 'smgproj'
  };

  constructor(scene, x, y, key = 'guns', frame = 'minigun') {
    super(scene, x, y, key, frame);
  }

}

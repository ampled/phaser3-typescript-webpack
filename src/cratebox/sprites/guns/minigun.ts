import { Smg } from 'cratebox/sprites/guns/smg';
import { GunProps } from 'cratebox/sprites/guns/gun';

export class Minigun extends Smg implements GunProps {
  name = 'M I N I G U N';
  sfx = 'enemyshot';

  cooldown = 40;
  shootTimer = 30;
  recoil = 4000;
  damage = 1.2;
  pushBackFloor = 300;
  pushBackAir = 1250;
  angleSpread = 150;

  projectile = {
    velocity: 500,
    size: 5,
    gravity: false,
    key: 'smgproj'
  };

  constructor(scene, x, y, key = 'minigun') {
    super(scene, x, y, key);
  }

}

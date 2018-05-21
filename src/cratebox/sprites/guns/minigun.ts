import { Smg } from 'cratebox/sprites/guns/smg';
import { GunProps } from 'cratebox/sprites/guns/gun';

export class Minigun extends Smg implements GunProps {
  static id = 'MINIGUN';
  id = 'MINIGUN';
  sfx = 'enemyshot';
  sfxRate = 0.5;

  cooldown = 40;
  shootTimer = 30;
  recoil = 10;
  damage = 1.4;
  pushBackFloor = 90;
  pushBackAir = 300;
  angleSpread = 150;

  projectile = {
    velocity: 600,
    size: 5,
    gravity: false,
    key: 'smgproj'
  };

  constructor(scene, x, y, key = 'guns', frame = 'minigun') {
    super(scene, x, y, key, frame);
  }

}

import { Smg } from 'cratebox/sprites/guns/smg';
import { GunProps } from 'cratebox/sprites/guns/gun';

export class Minigun extends Smg implements GunProps {
  static id = 'MINIGUN';
  id = 'MINIGUN';
  sfx = 'enemyshot';
  sfxMin = .5;
  sfxMax = .5;

  cooldown = 40;
  shootTimer = 30;
  recoil = 10;
  damage = 2;
  pushBackFloor = 90;
  pushBackAir = 300;
  angleSpread = 150;

  projectile = {
    velocity: 600,
    size: 5,
    gravity: false,
    key: 'smgproj',
    anim: 'projectilefast'
  };

  constructor(scene, x, y, key = 'guns', frame = 'minigun') {
    super(scene, x, y, key, frame);
  }

  shoot(): number {
    this.scene.minishake();
    return super.shoot();
  }

  projectileCollide = (projectile, scene) => {
    scene.events.emit('sfx', 'foley');
    projectile.destroy();
  }

}

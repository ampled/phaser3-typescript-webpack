import { Enemy } from './enemy_base';

export class BigRobot extends Enemy {
  baseVel: number = 70;
  vel: number = 70;
  health = 12;
  isFirst = true;
  falling = false;
  killAt: number = 0;
  canDamage = true;
  isMad = false;

  constructor(scene, x, y, dir) {
    super(scene, x, y, dir, 'benemies', 'bigwalk');
  }

}

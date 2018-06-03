import { Enemy } from './enemy_base';

export class SmallRobot extends Enemy {
  baseVel: number = 90;
  vel: number = 90;
  health = 6;
  isFirst = true;
  falling = false;
  killAt: number = 0;
  canDamage = true;
  isMad = false;

  constructor(scene, x, y, dir) {
    super(scene, x, y, dir, 'enemies', 'enemywalk');
  }

}

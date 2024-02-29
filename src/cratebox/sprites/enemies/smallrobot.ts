import { Enemy } from './enemy';

export class SmallRobot extends Enemy {
  baseVel: number = 90 * 2;
  madVel: number = 120 * 3;
  vel: number = 90 * 2;
  health = 6;
  isFirst = true;
  falling = false;
  killAt: number = 0;
  canDamage = true;
  isMad = false;
  animWalk: string = 'enemywalk';
  animMad: string = 'enemywalkmad';

  constructor(scene, x, y, dir) {
    super(scene, x, y, dir, 'enemies');
  }
}

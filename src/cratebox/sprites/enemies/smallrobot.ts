import { Enemy } from './enemy_base';

export class SmallRobot extends Enemy {
  baseVel: number = 90;
  madVel: number = 110;
  vel: number = 90;
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

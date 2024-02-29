import { Enemy } from './enemy';

export class BigRobot extends Enemy {
  baseVel: number = 70 * 2;
  madVel: number = 90 * 2;
  vel: number = 70 * 2;
  baseHealth = 12;
  health = 12;
  isFirst = true;
  falling = false;
  killAt: number = 0;
  canDamage = true;
  isMad = false;
  animWalk: string = 'bigwalk';
  animMad: string = 'bigwalkmad';

  constructor(scene, x, y, dir) {
    super(scene, x, y, dir, 'benemies');
  }
}

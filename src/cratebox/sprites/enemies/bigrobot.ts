import { Enemy } from './enemy_base';

export class BigRobot extends Enemy {
  baseVel: number = 70;
  madVel: number = 90;
  vel: number = 70;
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

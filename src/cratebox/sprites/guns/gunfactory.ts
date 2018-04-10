import { guns, Gun, DefaultGun } from '.';

export class GunFactory {
  static roll = 0;
  static defaultGun = DefaultGun;

  static createGun(scene, x, y, GunClass: typeof Gun): Gun {
    return new GunClass(scene, x, y);
  }

  static createRandomGun(scene, x, y): Gun {
    return this.createGun(scene, x, y, this.getRandomGun());
  }

  static createDefaultGun(scene, x, y): Gun {
    return this.createGun(scene, x, y, this.defaultGun);
  }

  static getRandomGun(): typeof Gun {
    const roll = Phaser.Math.Between(0, guns.length - 1);
    if (roll !== this.roll) {
      this.roll = roll;
      return guns[roll];
    } else {
      return this.getRandomGun();
    }
  }

}
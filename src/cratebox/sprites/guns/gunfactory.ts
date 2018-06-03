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

  // static createRandomGun(scene, x, y): Gun {
  //   return this.createGun(scene, x, y, this.defaultGun);
  // }

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

  static getNextGun(scene, x, y, currentGun: Gun): Gun {
    let nextIndex: number;
    const currentIndex = guns.findIndex(gun => gun.id === currentGun.id);
    nextIndex = currentIndex + 1;
    if (currentIndex >= guns.length - 1) {
      nextIndex = 0;
    }
    return this.createGun(scene, x, y, guns[nextIndex]);
  }

}

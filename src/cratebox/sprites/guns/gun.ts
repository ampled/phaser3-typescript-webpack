import { CrateboxScene } from 'cratebox/cratebox.scene';

export interface GunProps {
  id: string;
  sfx: string;
  cooldown: number;
  recoil: number;
  damage: number;
  size: number;
}

export interface ProjectileConfig {
  velocity: number;
  size: number;
  gravity: boolean;
  amount?: number;
  key: string;
}

export class Gun extends Phaser.GameObjects.Sprite implements GunProps {
  public static id: string;
  id: string;
  sfx: string;
  cooldown: number;
  recoil: number;
  damage: number;
  size: number;
  body: Phaser.Physics.Arcade.Body;
  scene: CrateboxScene;

  shootTimer: number;

  constructor(scene, x, y, key = 'gun', frame?) {
    super(scene, x, y, key, frame);
    this.scene.physics.world.enable(this as Phaser.GameObjects.Sprite);
    // this.setAlpha(0);
  }

  shoot(...args: any[]): undefined | number {
    return;
  }

  update(time: number, delta: number): void {
    //
  }

  preDestroy(): void { }

}

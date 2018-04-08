import { CrateboxScene } from 'cratebox/cratebox.scene';

export interface GunProps {
  name: string;
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
  name: string;
  sfx: string;
  cooldown: number;
  recoil: number;
  damage: number;
  size: number;
  body: Phaser.Physics.Arcade.Body;
  scene: CrateboxScene;

  shootTimer: number;

  constructor(scene, x, y, key = 'gun') {
    super(scene, x, y, key);
    this.scene.physics.world.enable(this);
  }

  shoot(...args: any[]): void {
    //
  }

  update(time: number, delta: number): void {
    //
  }

  preDestroy(): void { }

}

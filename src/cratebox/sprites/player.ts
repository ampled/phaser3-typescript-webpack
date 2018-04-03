
export class Player extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;
  gun;

  constructor(config: any) {
    super(config.scene, config.x, config.y, config.key)
  }

  update(keys: any, time: number, delta: any): void {
    //
  }

  shoot(): void {
    //
  }

}
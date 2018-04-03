import { CrateboxScene } from 'cratebox/cratebox.scene';

export class Player extends Phaser.Physics.Arcade.Sprite {
  body: Phaser.Physics.Arcade.Body;
  anims: Phaser.Animations.AnimationManager;
  dir: 'l' | 'r';
  falling = false;
  shooting = false;

  scene: CrateboxScene;

  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
  }

  update(time: number, delta: number) {
    let anim = 'stand';

    // if (this.scene.shootTimer > 0) {
    //   this.shooting = true;
    // } else {
    //   this.shooting = false;
    // }

    if (this.scene.shootTimer < 150) {
      this.scene.gunBody.setAngularVelocity(0);
      this.scene.gun.setAngle(0);
      this.scene.gun.setSize(16, 16);
    }

    if (this.body.velocity.y !== 0) {
      anim = 'jump';
    } else if (this.shooting) {
      anim = 'shoot';
    } else if (this.body.velocity.x !== 0) {
      anim = 'run';
    } else {
      anim = 'stand';
    }

    if ((<any>this.anims).getCurrentKey() !== anim) {
      this.anims.play(anim, void 0);
    }
  }
}

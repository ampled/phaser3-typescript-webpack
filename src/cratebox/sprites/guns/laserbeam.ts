import { CrateboxScene } from 'cratebox/cratebox.scene';

export class LaserBeam extends Phaser.GameObjects.Sprite {
  scene: CrateboxScene;
  exploded = false;

  constructor(scene, x, y, key = 'projectiles', frame = 'projectile') {
    super(scene, x, y, key, frame);
    this.scene.physics.world.enable(this);
    this.setScale(.2, .2);
    this.scene.tweens.add({
      targets: this,
      duration: 800,
      scaleY: 1,
      scaleX: 1
    });
    this.scene.time.addEvent({
      delay: 1000,
      callback: this.explode,
      args: [this, this.scene],
      callbackScope: this
    });
  }

  update(time: number, delta: number): void {
    if (!this.exploded) {
      this.x = this.scene.player.flipX ? this.scene.player.x - 21 : this.scene.player.x + 21;
      this.y = this.scene.player.y - 1;
      this.flipX = this.scene.player.flipX;
    }
  }

  explode = (beam: LaserBeam, scene: CrateboxScene) => {
    scene.events.emit('sfx', 'laser2');
    scene.minishake();
    beam.x = scene.player.flipX ? scene.player.x - 16 : scene.player.x + 16;
    beam.setFrame('beam00');
    beam.flipY = true;
    beam.body.setOffset(beam.flipX ? -8 : 8, 0);
    beam.setOrigin(beam.flipX ? 1 : 0, .5);

    beam.setScale(1, 3);
    beam.exploded = true;
    scene.tweens.add({
      targets: beam,
      ease: Phaser.Math.Easing.Sine.In,
      scaleX: 24,
      duration: 100
    });
    scene.time.addEvent({
      delay: 200,
      callback(b: LaserBeam, s: CrateboxScene) {
        s.tweens.add({
          targets: b,
          scaleY: 0,
          duration: 100,
          onComplete: (tween, beams: LaserBeam[]) => beams[0].destroy()
        });
      },
      args: [beam, scene]
    });
  }

}

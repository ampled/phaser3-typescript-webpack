import { CrateboxScene } from 'cratebox/cratebox.scene';

export function createExplosion(scene: CrateboxScene, x: number, y: number) {
  scene.events.emit('sfx', 'death', Phaser.Math.FloatBetween(0.3, 0.5));
  const explosion = scene.add.circle(x, y, 40, Phaser.Display.Color.GetColor(255, 255, 175), 1);
  explosion.setData('dmg', 6).setData('force', 7);
  scene.minishake();
  explosion.setStrokeStyle(10, 0xff0000, 0.5);
  scene.explosionGroup.add(explosion);

  const body: Phaser.Physics.Arcade.Body = explosion.body as any;
  body.setCircle(10, 0.5, 0.5);
  body.allowGravity = false;

  scene.add.tween({
    targets: explosion,
    radius: 80,
    // fillAlpha: 0.4,
    duration: 400,
    yoyo: false,
    ease: Phaser.Math.Easing.Back.InOut,
    onComplete: () => {
      explosion?.destroy();
    },
    onUpdate: (tween) => {
      const value = tween.getValue();
      console.log(value);
      body.setCircle(value, 0.5, 0.5);
      if (value >= 70) {
        explosion.setFillStyle(0x000000);
        explosion.setStrokeStyle(10, 0xffff00);
      }
    },
  });

  return explosion;
}

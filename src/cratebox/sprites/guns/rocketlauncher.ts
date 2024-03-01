import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import { createExplosion } from './explosion';

export class RocketLauncher extends Gun implements GunProps {
  static id = 'ROCKETLAUNCHER';
  id = 'ROCKETLAUNCHER';
  sfx = 'shoot';
  sfxRate = 0.5;

  cooldown = 1200;
  recoil = 200;
  damage = 6;
  size = 10;

  shootTimer = 1201;

  projectile: ProjectileConfig = {
    velocity: 50,
    size: 5,
    gravity: false,
    key: 'rocket',
  };

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'rl') {
    super(scene, x, y, key, frame);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x - 3 : this.scene.player.x + 3;
    this.y = this.scene.player.y;
    this.flipX = this.scene.player.flipX;
    this.setDepth(this.flipX ? 11 : 9);
    if (this.shootTimer > this.cooldown / 2) {
      this.body.setAngularVelocity(0);
      this.setAngle(0);
    }

    this.shootTimer += delta;
  }

  shoot() {
    this.shootTimer = 0;

    this.scene.events.emit('sfx', this.sfx, this.sfxRate);

    const rocket = this.scene.projectileGroup
      .create(this.x, this.y, 'projectiles', this.projectile.key)
      .setData('dmg', this.damage)
      .setData('onCollide', this.projectileCollide)
      .setData('onEnemy', this.explode) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    rocket.flipX = this.flipX;

    rocket.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setAccelerationX(this.flipX ? -300 : 300)
      .setAccelerationY(Phaser.Math.Between(-7, 7))
      .setSize(this.projectile.size, this.projectile.size).allowGravity = this.projectile.gravity;

    const smoke = this.scene.createSmokeEmitter(0, 0, this.id, rocket);

    rocket.setData('smoke', smoke);

    this.scene.tweens.add({
      targets: this,
      duration: 75,
      ease: 'Sine.easeInOut',
      yoyo: true,
      angle: this.flipX ? 30 : -30,
      displayOriginX: this.flipX ? this.displayOriginX - 5 : this.displayOriginX + 5,
    });

    return 0;
  }

  explode = (rocket: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, _enemy: any, scene: CrateboxScene) => {
    if (rocket.getData('smoke').active) {
      const smoke: Phaser.GameObjects.Particles.ParticleEmitter = rocket.getData('smoke');
      if (smoke) {
        smoke.particleAngle = { min: 0, max: 360 };
        smoke.emitParticleAt(rocket.x, rocket.y, 200);
        smoke.stop();
        scene.time.delayedCall(1000, (s: typeof smoke) => s.destroy(), [smoke]);
      }
    }

    if (rocket.active) {
      const a = new Phaser.Geom.Point(rocket.x, rocket.y);
      rocket.destroy();
      const explosion = createExplosion(scene, a.x, a.y);
      // scene.events.emit('sfx', 'death', 0.5);
      // rocket.destroy();
      // const explosion = scene.add.image(
      //   a.x,
      //   a.y,
      //   'explosion'
      // ) as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
      // scene.physics.world.enable(explosion);
      // explosion.body.allowGravity = false;
      // explosion.setData('dmg', 6).setData('force', 7);
      // scene.explosionGroup.add(explosion);
      // scene.minishake();
      // explosion.setTint(Phaser.Display.Color.GetColor(0, 0, 0));

      // scene.tweens.add({
      //   targets: explosion,
      //   duration: 190,
      //   ease: 'Back',
      //   yoyo: true,
      //   scaleX: 5.5,
      //   scaleY: 5.5,
      //   onComplete(
      //     tween: Phaser.Tweens.Tween,
      //     expl: Phaser.GameObjects.Image[]
      //   ) {
      //     expl[0].destroy();
      //   },
      //   onUpdate(tween: Phaser.Tweens.Tween, expl: Phaser.GameObjects.Image) {
      //     const p = tween.getValue();
      //     expl.setAlpha(0.16 * p);
      //     if (p > 4) {
      //       expl.setTint(Phaser.Display.Color.GetColor(255, 255, 0));
      //     }
      //     if (p > 5.6) {
      //       expl.setTint(Phaser.Display.Color.GetColor(255, 255, 255));
      //     }
      //   },
      // });
    }
  };

  projectileCollide = (projectile, scene) => {
    this.explode(projectile, undefined, scene);
  };

  enemyCollide = (projectile, enemy, scene?) => {
    this.explode(projectile, enemy, scene);
  };
}

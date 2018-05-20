import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';

export class RocketLauncher extends Gun implements GunProps {
  static id = 'ROCKETLAUNCHER';
  id = 'ROCKETLAUNCHER';
  sfx = 'shoot';
  sfxRate = 0.5;

  cooldown = 1200;
  recoil = 200;
  damage = .1;
  size = 10;

  shootTimer = 1201;

  projectile: ProjectileConfig = {
    velocity: 250,
    size: 5,
    gravity: false,
    key: 'smgproj'
  };

  scene: CrateboxScene;

  smoke: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene, x, y, key = 'guns', frame = 'rl') {
    super(scene, x, y, key, frame);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x - 8 : this.scene.player.x + 8;
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
    console.log(this, 'shoot');

    this.shootTimer = 0;

    this.scene.events.emit('sfx', this.sfx, this.sfxRate);

    const grenade: any =
      this.scene.projectileGroup.create(this.x, this.y, 'projectiles', 'rocket')
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide)
        .setData('onEnemy', this.explode)

    grenade.flipX = this.flipX;

    grenade.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;

    this.smoke = this.scene.smokeEmitter
      .createEmitter({
        // x: this.x,
        // y: this.y,
        frame: 'smoke',
        scale: { start: 1.5, end: 0.5 },
        alpha: { start: .9, end: 0.2 },
        lifespan: 400,
        speed: { min: 50, max: 100 },
        follow: grenade,
        frequency: 0
      });

    console.log(this.smoke);

    // this.smoke.explode(50, this.x, this.y);

    this.scene.tweens.add({
      targets: this,
      duration: 75,
      ease: 'Sine.easeInOut',
      yoyo: true,
      angle: this.flipX ? 30 : -30,
      displayOriginX: this.flipX ? this.displayOriginX - 5 : this.displayOriginX + 5,
    });

    this.scene.time.addEvent({
      delay: 1000,
      callback: this.explode,
      callbackScope: this.scene,
      args: [grenade, undefined, this.scene],
      loop: false,
      repeat: false
    } as any);

    return 0;
  }

  explode = (grenade, enemy, scene: CrateboxScene) => {
    if (this.smoke.active) {
      scene.smokeEmitter.emitters.remove(this.smoke);
      // scene.smokeEmitter.emitters.removeAll();
    }

    if (grenade.active) {
      scene.events.emit('sfx', 'death', 0.5);
      const a = new Phaser.Geom.Point(grenade.x, grenade.y);
      grenade.destroy();
      const explosion = scene.add.image(a.x, a.y, 'explosion');
      scene.physics.world.enable(explosion);
      explosion.body.allowGravity = false;
      explosion.setData('dmg', 2).setData('force', 10);
      scene.explosionGroup.add(explosion);
      scene.minishake();
      explosion.setTint(Phaser.Display.Color.GetColor(0, 0, 0));

      scene.tweens.add({
        targets: explosion,
        duration: 190,
        ease: 'Back',
        yoyo: true,
        scaleX: 7,
        scaleY: 6,
        onComplete(tween: Phaser.Tweens.Tween, expl: Phaser.GameObjects.Image[]) {
          expl[0].destroy();
        },
        onUpdate(tween: Phaser.Tweens.Tween, expl: Phaser.GameObjects.Image) {
          const p = tween.getValue();
          expl.setAlpha(.16 * p);
          if (p > 5) {
            expl.setTint(Phaser.Display.Color.GetColor(255, 255, 0));
          }
          if (p > 7) {
            expl.setTint(Phaser.Display.Color.GetColor(255, 255, 255));
          }
        }
      });
    }

  }

  projectileCollide = (projectile, scene) => {
    this.explode(projectile, undefined, scene);
  }

  enemyCollide = (projectile, enemy, scene?) => {
    this.explode(projectile, enemy, scene);
  }

}

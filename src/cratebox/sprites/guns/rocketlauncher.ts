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
    velocity: 50,
    size: 5,
    gravity: false,
    key: 'rocket'
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

    const grenade: Phaser.GameObjects.GameObject =
      this.scene.projectileGroup.create(this.x, this.y, 'projectiles', this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide)
        .setData('onEnemy', this.explode);

    (<any>grenade).flipX = this.flipX;

    grenade.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setAccelerationX(this.flipX ? -300 : 300)
      .setAccelerationY(Phaser.Math.Between(-7, 7))
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;

    const smoke = this.scene.smokeEmitter
      .createEmitter({
        frame: 'smoke',
        angle: { min: -120, max: 120 },
        scale: { start: 1.5, end: 0.5 },
        alpha: { start: 1, end: .5 },
        lifespan: 400,
        speed: { min: 50, max: 100 },
        follow: grenade,
        frequency: 100,
        quantity: 3,
        blendMode: 'MULTIPLY'
      });

    grenade.setData('smoke', smoke);

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

  explode = (grenade, enemy, scene: CrateboxScene) => {
    if (grenade.getData('smoke').active) {
      scene.smokeEmitter.emitters.remove(grenade.getData('smoke'));
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
        scaleX: 5.5,
        scaleY: 5.5,
        onComplete(tween: Phaser.Tweens.Tween, expl: Phaser.GameObjects.Image[]) {
          expl[0].destroy();
        },
        onUpdate(tween: Phaser.Tweens.Tween, expl: Phaser.GameObjects.Image) {
          const p = tween.getValue();
          expl.setAlpha(.16 * p);
          if (p > 4) {
            expl.setTint(Phaser.Display.Color.GetColor(255, 255, 0));
          }
          if (p > 5.6) {
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

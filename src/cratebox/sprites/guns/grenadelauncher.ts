import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';

export class GrenadeLauncher extends Gun implements GunProps {
  static id = 'GRENADELAUNCHER';
  id = 'GRENADELAUNCHER';
  sfx = 'shoot';
  sfxRate = 0.5;

  cooldown = 1200;
  recoil = 200;
  damage = 6;
  size = 10;

  shootTimer = 1200;

  projectile: ProjectileConfig = {
    velocity: 250,
    size: 5,
    gravity: true,
    key: 'smgproj'
  };

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'gl') {
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
    this.shootTimer = 0;

    this.scene.events.emit('sfx', this.sfx, this.sfxRate);

    const grenade =
      this.scene.projectileGroup.create(this.x, this.y, 'projectiles', 'smgproj')
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide)
        .setData('onEnemy', this.explode);

    grenade.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setDragX(190)
      .setVelocityY(-200)
      .setFrictionX(1000)
      .setSize(this.projectile.size, this.projectile.size)
      .setBounce(1, .5)
      .allowGravity = this.projectile.gravity;

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
      loop: false
    });

    return 0;
  }

  explode = (grenade, enemy, scene: CrateboxScene) => {
    if (grenade.active) {
      scene.events.emit('sfx', 'death', 0.5);
      const a = new Phaser.Geom.Point(grenade.x, grenade.y);
      grenade.destroy();
      const explosion = scene.add.image(a.x, a.y, 'explosion');
      scene.physics.world.enable(explosion);
      explosion.body.allowGravity = false;
      explosion.setData('dmg', 6).setData('force', 10);
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
    // nada
  }

  enemyCollide = (projectile, enemy, scene?) => {
    this.explode(projectile, enemy, scene);
  }

}

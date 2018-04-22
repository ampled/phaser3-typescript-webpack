import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';

export class GrenadeLauncher extends Gun implements GunProps {
  static id = 'GRENADELAUNCHER';
  id = 'GRENADELAUNCHER';
  sfx = 'shoot';
  sfxRate = 0.5;

  cooldown = 1200;
  shootTimer = 1000;
  recoil = 200;
  damage = .1;
  size = 10;

  projectile: ProjectileConfig = {
    velocity: 250,
    size: 5,
    gravity: true,
    key: 'smgproj'
  };

  projectileTimer = 0;
  projRef;
  explosion: Phaser.GameObjects.Image;
  explosionTween: Phaser.Tweens.Tween;

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'gun') {
    super(scene, x, y, key, frame);
    // this.scene.physics.world.enable(this);
    this.body.setSize(this.size, this.size).allowGravity = false;
    this.flipY = true;
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
    this.projectileTimer += delta;
    if (this.projectileTimer > 1000) {
      if (this.projRef && this.projRef.active) {
        this.explodeGrenade();
      }
    }

    if (this.explosion && this.explosion.active) {
      // this.exploshun.destroy();
    }
  }

  shoot() {
    this.scene.events.emit('sfx', this.sfx, this.sfxRate);
    this.projRef =
      this.scene.projectileGroup.create(this.x, this.y, this.projectile.key)
        .setData('dmg', this.damage)
        .setData('onCollide', this.projectileCollide)
        .setData('onEnemy', this.enemyCollide);

    this.projRef.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setDragX(190)
      .setVelocityY(-200)
      .setFrictionX(1000)
      .setSize(this.projectile.size, this.projectile.size)
      .setBounce(1, .5)
      .allowGravity = this.projectile.gravity;
    this.body.setAngularVelocity(this.flipX ? this.recoil : -this.recoil);
    this.shootTimer = 0;
    this.projectileTimer = 0;
    return 0;
  }

  preDestroy(): void {
    if (this.projRef) {
      this.projRef.destroy();
    }
  }

  explodeGrenade = () => {
    console.log('createexplosh', this.projRef);
    this.scene.events.emit('sfx', 'death', 0.5);
    const a = new Phaser.Geom.Point(this.projRef.x, this.projRef.y);
    console.log(a);

    this.explosion = this.scene.add.image(a.x, a.y, 'explosion');
    console.log(this.explosion);
    this.scene.physics.world.enable(this.explosion);
    this.explosion.body.allowGravity = false;
    this.explosion.setData('dmg', 2).setData('force', 10);
    this.scene.explosionGroup.add(this.explosion);
    this.scene.minishake();
    this.explosion.setTint(Phaser.Display.Color.GetColor(0, 0, 0));

    this.explosionTween = this.scene.tweens.add({
      targets: this.explosion,
      duration: 190,
      ease: 'Back',
      yoyo: true,
      scaleX: 7,
      scaleY: 6,
      onComplete: () => {
        this.explosion.destroy();
      },
      onUpdate: () => {
        // this.explosion.setTint(Phaser.Display.Color.RandomRGB(100, 255).color);
        const p = this.explosionTween.getValue();
        console.log(p);
        this.explosion.setAlpha(.16 * p);
        // this.explosion.setTint(Phaser.Display.Color.GetColor(255, 255, 25 * p));
        if (p > 5) {
          this.explosion.setTint(Phaser.Display.Color.GetColor(255, 255, 0));
        }
        if (p > 7) {
          this.explosion.setTint(Phaser.Display.Color.GetColor(255, 255, 255));
        }
      }
      // x: 1,
      // y: 1,
      // repeat: -1
    });
    // console.log(tween);
    this.projRef.destroy();
  }

  projectileCollide = (projectile, scene) => {
    // scene.events.emit('sfx', 'foley', 2);
    // projectile.destroy();
  }

  enemyCollide = (projectile, enemy) => {
    this.explodeGrenade();
  }

}

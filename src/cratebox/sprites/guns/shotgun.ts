import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import { noop } from 'util/';

export class Shotgun extends Gun implements GunProps {
  static id = 'SHOTGUN';
  id = 'SHOTGUN';
  sfx = 'death';
  reloaded = true;

  cooldown = 650;
  shootTimer = 650;
  recoil = 800;
  damage = 1.5;
  size = 10;

  projectile: ProjectileConfig = {
    velocity: 900,
    amount: 6,
    size: 3,
    gravity: false,
    key: 'smgproj'
  };

  projectileTimer = 0;
  projRef: Phaser.GameObjects.GameObject[] = [];

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'shotgun') {
    super(scene, x, y, key, frame);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x - 8 : this.scene.player.x + 8;
    this.y = this.scene.player.y;
    this.flipX = this.scene.player.flipX;
    this.setDepth(this.flipX ? 11 : 9);
    this.shootTimer += delta;
    this.projectileTimer += delta;

    // if (this.projectileTimer > 270) {
    //   this.projRef.forEach(proj => proj.destroy());
    // }
    if (this.shootTimer > this.cooldown - 200 && !this.reloaded) {
      this.scene.events.emit('sfx', 'shotgunreload');
      this.reloaded = true;
    }
  }

  shoot() {
    this.scene.events.emit('sfx', this.sfx);
    this.scene.minishake();
    this.projRef =
      this.scene.projectileGroup
        .createMultiple({
          key: 'projectiles',
          frame: this.projectile.key,
          repeat: this.projectile.amount,
          setXY: { x: this.x, y: this.y }
        } as any);
    this.projRef.forEach(proj => {
      proj.body
        .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
        .setVelocityY(Phaser.Math.Between(-150, 120))
        .setSize(this.projectile.size, this.projectile.size)
        .setBounce(.7, 2)
        .setDragX(Phaser.Math.Between(3000, 4000))
        .allowGravity = this.projectile.gravity;
    });
    this.projRef.forEach(proj =>
      proj.setData('dmg', this.damage)
        .setData('id', 'shotgun')
        .setData('onCollide', this.projectileCollide)
        .setData('force', 4)
    );
    this.scene.time.addEvent({
      delay: 270,
      // tslint:disable-next-line:object-literal-shorthand
      callback() {
        const scene = this as CrateboxScene;
        scene.projectileGroup.children.each(proj => {
          proj.getData('id') === 'shotgun' ? proj.destroy() : noop();
        }, undefined);
      },
      callbackScope: this.scene,
      repeat: false,
      loop: false
    } as any);

    this.scene.tweens.add({
      targets: this,
      duration: 200,
      ease: 'Power2',
      yoyo: true,
      angle: this.flipX ? 90 : -90,
    });
    this.shootTimer = 0;
    this.projectileTimer = 0;
    this.reloaded = false;
    return 0;
  }

  preDestroy(): void {
    // this.projRef.forEach(proj => proj.destroy());
  }

  projectileCollide = (projectile, scene) => {
    projectile.setAlpha(.7);
  }

}

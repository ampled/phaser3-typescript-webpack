import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import { noop } from 'util/';

export class FryingPan extends Gun implements GunProps {
  static id = 'FRYINGPAN';
  id = 'FRYINGPAN';
  sfx = 'shoot';
  reloaded = true;

  cooldown = 300;
  shootTimer = 300;
  recoil = 800;
  damage = 7;
  size = 32;

  projectile: ProjectileConfig = {
    velocity: 900,
    amount: 6,
    size: 3,
    gravity: false,
    key: 'smgproj'
  };

  shooting = false;
  projectileTimer = 0;
  projRef: Phaser.GameObjects.GameObject[] = [];

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'fryingpan') {
    super(scene, x, y, key, frame);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    if (!this.shooting) {
      this.setFrame('fryingpan');
      this.x = this.flipX ? this.scene.player.x + 8 : this.scene.player.x - 8;
    }

    this.y = this.scene.player.y - 4;
    this.flipX = this.scene.player.flipX;
    this.setDepth(this.flipX ? 11 : 9);
    this.shootTimer += delta;
  }

  shoot() {
    this.scene.events.emit('sfx', this.sfx);
    this.shootTimer = 0;
    this.shooting = true;
    this.setData('melee', true);
    this.setData('dmg', this.damage);
    this.setData('flip', true);
    this.scene.projectileGroup.add(this);
    this.x = this.flipX ? this.scene.player.x - 16 : this.scene.player.x + 16;
    this.scene.tweens.add({
      targets: this,
      duration: 70,
      // ease: 'Sine.easeIn',
      yoyo: false,
      x: this.flipX ? this.scene.player.x - 16 : this.scene.player.x + 16,
      callbackScope: this,
      onUpdate() {
        if (this.active) {
          this.x = this.flipX ? this.scene.player.x - 16 : this.scene.player.x + 16;
        }
      },
      onComplete() {
        if (this.active) {
          const scene = this.scene as CrateboxScene;
          this.shooting = false;
          scene.projectileGroup.remove(this);
          this.x = this.flipX ? this.scene.player.x + 8 : this.scene.player.x - 8;
        }
      }
    });
    this.setFrame('fryingpanattack');
    return 0;
  }

  enemyCollide = (projectile, enemy, scene?) => {
    enemy.flip();
  }

  preDestroy(): void {
    // this.projRef.forEach(proj => proj.destroy());
  }

  projectileCollide = (projectile, scene) => {
    projectile.setAlpha(.7);
  }

}

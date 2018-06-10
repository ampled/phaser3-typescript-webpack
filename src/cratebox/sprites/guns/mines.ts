import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import Sprite = Phaser.GameObjects.Sprite;

export class Mines extends Gun implements GunProps {
  static id = 'MINES';
  id = 'MINES';
  sfx = 'shoot';
  sfxRate = 1;

  cooldown = 1200;
  recoil = 200;
  damage = 6;
  size = 10;

  shootTimer = 1200;

  projectile: ProjectileConfig = {
    velocity: 0,
    size: 16,
    gravity: true,
    key: 'smgproj'
  };

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'mine') {
    super(scene, x, y, key, frame);
    this.body.setSize(this.size, this.size).allowGravity = false;
  }

  update(time: number, delta: number): void {
    this.x = this.flipX ? this.scene.player.x - 8 : this.scene.player.x + 8;
    this.y = this.scene.player.y - 4;
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

    const mine =
      this.scene.add.sprite(this.x, this.y, 'guns', 'mine')
        .setData('dmg', 0)
        // .setData('onCollide', this.projectileCollide)
        .setData('inExplosion', this.explode)
        .setData('onEnemy', this.explode) as Phaser.GameObjects.Sprite;

    this.scene.physics.world.enable(mine);
    const collider =
      this.scene.physics.add.collider(
        mine,
        this.scene.groundLayer,
        (m: Sprite) => {
          m.setAngle(0);
        }
      );

    mine.setData('collider', collider);

    mine.setAngle(10);

    mine.body
      .setSize(this.projectile.size, this.projectile.size)
      .allowGravity = this.projectile.gravity;

    // Arm the mine after a second
    this.scene.time.addEvent({
      delay: 1000,
      callback(m: Phaser.GameObjects.Sprite) {
        const scene = this as CrateboxScene;
        scene.events.emit('sfx', 'shotgunreload2');
        m.setFrame('minearmed');
        scene.projectileGroup.add(m);
      },
      callbackScope: this.scene,
      args: [mine],
      loop: false
    });

    return 0;
  }

  explode = (mine, enemy, scene: CrateboxScene) => {
    if (mine.active) {
      scene.events.emit('sfx', 'death', 0.5);
      const a = new Phaser.Geom.Point(mine.x, mine.y);
      const collider = mine.getData('collider') as Phaser.Physics.Arcade.Collider;
      if (collider) {
        collider.destroy();
      }
      mine.destroy();
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

  projectileCollide = (mine, scene) => {
    mine.setAngle(0);
  }

  enemyCollide = (projectile, enemy, scene?) => {
    this.explode(projectile, enemy, scene);
  }

}

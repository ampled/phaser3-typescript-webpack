import { Pistol } from 'cratebox/sprites/guns/pistol';
import { GunProps } from 'cratebox/sprites/guns/gun';
import Sprite = Phaser.GameObjects.Sprite;
import Tween = Phaser.Tweens.Tween;
import { CrateboxScene } from 'cratebox/cratebox.scene';
import { Player } from 'cratebox/sprites/player';

export class Flamethrower extends Pistol implements GunProps {
  static id = 'FLAMETHROWER';
  id = 'FLAMETHROWER';
  sfx = 'flamethrower';
  sfxCounter = 0;

  cooldown = 50;
  shootTimer = 30;
  damage = 2;
  angleSpread = 100;

  projectile = {
    velocity: 300,
    size: 16,
    gravity: true,
    key: 'fire',
    anim: 'fire'
  };

  constructor(scene, x, y, key = 'guns', frame = 'flamethrower') {
    super(scene, x, y, key, frame);
  }

  shoot(): number {
    if (this.sfxCounter === 3) {
      this.scene.events.emit('sfx', this.sfx, Phaser.Math.FloatBetween(0.2, 1.5));
      this.sfxCounter = 0;
    } else {
      this.sfxCounter++;
    }

    const x = this.flipX ? this.x - 8 : this.x + 8;

    const projectile =
      this.scene.projectileGroup.create(x, this.y - 2, 'projectiles', this.projectile.key)
        .setData('melee', true)
        .setData('bypass', false)
        .setData('dmg', this.damage)
        .setData('color', Phaser.Math.Between(230, 255))
        .setData('onPlayer', this.onPlayer)
        .setData('onCollide', this.projectileCollide) as Phaser.GameObjects.Sprite;

    projectile.setTint(Phaser.Display.Color.GetColor(0, 100, 200));
    projectile.setAlpha(.45);
    projectile.z = 5;
    projectile.setDepth(50);

    projectile.body
      .setDrag(300, 450)
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setVelocityY(Phaser.Math.Between(-this.angleSpread, this.angleSpread))
      .setSize(this.projectile.size - 4, this.projectile.size - 8)
      .setFriction(1, 1)
      .setAngularVelocity(Phaser.Math.Between(-200, 200))
      .setBounceY(.2)
      .allowGravity = this.projectile.gravity;

    projectile.setScale(.5, .5);

    this.scene.tweens.add({
      targets: projectile,
      alpha: 1,
      scaleX: Phaser.Math.FloatBetween(1.5, 2.1),
      scaleY: Phaser.Math.FloatBetween(1.5, 2.5),
      duration: Phaser.Math.Between(600, 1200),
      ease: 'Back',
      yoyo: true,
      onComplete: (tween: Tween, fire: Sprite[]) => {
        fire[0].destroy();
      },
      onUpdate(tween: Tween, fire: Sprite) {
        const p = tween.getValue() * 10;
        if (p >= 10) {
          fire.anims.play('fire');
        }
        if (p > 5.6) {
          const c = p * 23;
          fire.setTint(
            Phaser.Display.Color.GetColor(fire.getData('color'), c, c)
          );
        }
      }
    });

    this.shootTimer = 0;
    return 0;
  }

  projectileCollide = (projectile: Sprite, scene) => {
    projectile.body.setVelocity(0, 50).allowGravity = false;
  }

  onPlayer = (fire, player: Player, scene: CrateboxScene) => {
    player.jump();
  }

}

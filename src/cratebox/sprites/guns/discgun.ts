import { Gun, GunProps, ProjectileConfig } from 'cratebox/sprites/guns/gun';
import { CrateboxScene } from 'cratebox/cratebox.scene';
import Sprite = Phaser.GameObjects.Sprite;

export class DiscGun extends Gun implements GunProps {
  static id = 'DISC GUN';
  id = 'DISC GUN';
  sfx = 'disc';
  reloaded = true;

  cooldown = 650;
  shootTimer = 650;
  recoil = 800;
  damage = 6;
  size = 10;

  projectile: ProjectileConfig = {
    velocity: 300,
    size: 3,
    gravity: false,
    key: 'smgproj',
    anim: 'disc'
  };

  projectileTimer = 0;
  projRef: Phaser.GameObjects.GameObject[] = [];

  scene: CrateboxScene;

  constructor(scene, x, y, key = 'guns', frame = 'discgun') {
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
  }

  shoot() {
    this.scene.events.emit('sfx', this.sfx);
    const disc = this.scene.projectileGroup.create(this.x, this.y, 'projectiles', 'disc00') as Sprite;
    disc.anims.play('disc');

    disc
      .setData('dmg', this.damage)
      .setData('melee', true)
      .setData('bounced', false)
      .setData('onCollide', this.projectileCollide)
      .setData('onPlayer', this.onPlayer)
      .setData('onEnemy', this.enemyCollide);

    disc.body
      .setVelocityX(this.flipX ? -this.projectile.velocity : this.projectile.velocity)
      .setSize(this.projectile.size, this.projectile.size)
      .setBounceX(1)
      .allowGravity = this.projectile.gravity;

    this.scene.tweens.add({
      targets: this,
      duration: 100,
      ease: 'Power2',
      yoyo: true,
      displayOriginX: this.flipX ? this.displayOriginX - 6 : this.displayOriginX + 6,
    });
    this.shootTimer = 0;
    this.projectileTimer = 0;
    this.reloaded = false;
    return 0;
  }

  preDestroy(): void {
    // this.projRef.forEach(proj => proj.destroy());
  }

  projectileCollide = (disc: Sprite, scene: CrateboxScene) => {
    // console.log('disc collide', disc, disc.body.velocity.x)
    const bounced = disc.getData('bounced');
    if (bounced) {
      scene.events.emit('sfx', 'foley');
      disc.destroy();
    } else {
      scene.events.emit('sfx', 'foley');
      scene.events.emit('sfx', 'disc', 1.2);
      disc.setData('bounced', true);
    }
  }

  onPlayer = (disc, player, scene: CrateboxScene) => {
    scene.events.emit('sfx', 'disc', 1.3);
    scene.restart();
  }

  enemyCollide = (projectile, enemy, scene?) => {
    scene.events.emit('sfx', 'disc', 1.3);
  }

}

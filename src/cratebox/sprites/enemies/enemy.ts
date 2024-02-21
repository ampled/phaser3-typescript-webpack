import { CrateboxScene } from 'cratebox/cratebox.scene';

export class Enemy extends Phaser.GameObjects.Sprite {
  scene: CrateboxScene;
  body: Phaser.Physics.Arcade.Body;

  baseVel: number;
  madVel: number;
  vel: number;
  baseHealth = 6;
  health = 6;
  isFirst = true;
  falling = false;
  killAt: number = 0;
  isDead = false;
  canDamage = true;
  isMad = false;
  animWalk: string;
  animMad: string;
  smoke: Phaser.GameObjects.Particles.ParticleEmitter;
  id = Math.random().toString();

  constructor(
    scene: CrateboxScene,
    x: number,
    y: number,
    public dir: number,
    key: string
  ) {
    super(scene, x, y, key);

    this.scene.physics.world.enable(this);
  }

  firstUpdate(): void {
    this.anims.play(this.animWalk);
    this.vel = this.dir === 1 ? -this.baseVel : this.baseVel;
    this.body.setVelocityX(this.vel).setBounceY(0.2);
    this.setDepth(100);
    this.isFirst = false;
  }

  update(time: number, delta: number) {
    if (this.isFirst) {
      this.firstUpdate();
    }

    this.flipX = this.body.velocity.x < 0;

    if (this.body.velocity.x === 0) {
      this.vel = -this.vel;
      this.body.setVelocityX(this.vel);
    }

    if (this.body.onFloor() && this.falling) {
      this.scene.sys.sound.playAudioSprite('sfx', 'foley', { volume: 0.3 });
    }

    this.falling = this.body.velocity.y > 50;

    if (this.isDead) {
      return;
    }

    if (this.y > 400) {
      this.smoke = this.scene.createSmokeEmitter(this.x, this.y, this.id, this);

      this.y = -5;
      this.x = 200;

      if (this.body.velocity.x > 0) {
        this.vel = -this.madVel;
        this.body.setVelocityX(-this.madVel);
      } else {
        this.vel = this.madVel;
        this.body.setVelocityX(this.madVel);
      }

      this.health = this.baseHealth;
      this.scene.minishake();
      this.anims.play(this.animMad);
      this.scene.events.emit('sfx', 'enemyloop');
    }
  }

  damage(
    amount: number = 0,
    fromRight: boolean,
    multiplier = 2,
    flip = false
  ): void {
    this.canDamage = false;
    this.health -= amount;
    this.setTint(Phaser.Display.Color.GetColor(255, 0, 0));
    this.setScale(1, 1);
    if (flip) {
      this.flip();
    }
    if (this.health <= 0) {
      this.die(fromRight, multiplier);
    } else {
      this.scene.tweens.add({
        targets: this,
        duration: 70,
        // x: this.x + 20,
        scaleY: 0.7,
        yoyo: true,
        onComplete: () => {
          this.setTint(Phaser.Display.Color.GetColor(255, 255, 255));
          this.setScale(1, 1);
          this.canDamage = true;
        },
      });
    }
  }

  flip(): void {
    this.body.setVelocityX(-this.body.velocity.x);
  }

  die(fromRight, multiplier = 1) {
    this.isDead = true;
    this.body.allowGravity = true;
    this.scene.minishake();
    this.scene.events.emit('sfx', 'enemykill');
    this.scene.enemyGroup.remove(this);
    this.scene.killedEnemies.add(this);
    this.body.setVelocityY(Phaser.Math.Between(-100, -250) * (multiplier / 2));
    this.body.setVelocityX((fromRight ? -100 : 100) * multiplier);
    this.body.setAngularVelocity(Phaser.Math.Between(100, 1000));
    this.scene.time.addEvent({
      delay: 2000,
      callbackScope: this,
      callback: () => {
        if (this.smoke) {
          this.smoke.destroy();
        }
        this.scene.killedEnemies.remove(this);
        this.scene.physics.world.disable(this);
        this.destroy();
      },
    });
  }
}

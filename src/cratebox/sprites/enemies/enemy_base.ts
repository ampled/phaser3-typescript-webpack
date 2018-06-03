import { CrateboxScene } from 'cratebox/cratebox.scene';

export class Enemy extends Phaser.GameObjects.Sprite {
  scene: CrateboxScene;
  body: Phaser.Physics.Arcade.Body;

  baseVel: number;
  vel: number;
  health = 6;
  isFirst = true;
  falling = false;
  killAt: number = 0;
  canDamage = true;
  isMad = false;

  constructor(scene: CrateboxScene, x: number, y: number, public dir: number, key: string, anim: string) {
    super(scene, x, y, key);

    this.scene.physics.world.enable(this);
    this.anims.play(anim);
  }

  firstUpdate(): void {
    this.vel = this.dir === 1 ? -this.baseVel : this.baseVel;
    this.body.setVelocityX(this.vel).setBounceY(0.2);
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
      this.scene.sys.sound.playAudioSprite('sfx', 'foley', { volume: .3 });
    }

    this.falling = this.body.velocity.y > 50;

    if (this.killAt !== 0) {
      this.killAt -= delta;
      if (this.killAt < 0) {
        this.kill();
        return;
      }
      return;
    }

    if (this.y > 400) {
      this.y = -5;
      this.x = 200;
      this.vel = this.vel * 1.1;
      this.health = 6;
      this.scene.minishake();
      this.anims.play('enemywalkmad');
      this.scene.events.emit('sfx', 'enemyloop');
    }

  }

  damage(amount: number = 0, fromRight: boolean, multiplier = 1, flip = false): void {
    this.canDamage = false;
    this.health -= amount;
    this.setTint(Phaser.Display.Color.GetColor(255, 0, 0));
    this.setScale(1, 1);
    if (flip) {
      this.flip();
    }
    if (this.health <= 0) {
      this.dieAnim(fromRight, multiplier);
    } else {
      this.scene.tweens.add({
        targets: this,
        duration: 30,
        // x: this.x + 20,
        scaleY: .7,
        yoyo: true,
        onComplete: () => {
          this.setTint(Phaser.Display.Color.GetColor(255, 255, 255));
          this.setScale(1, 1);
          this.canDamage = true;
        }
      });
    }
  }

  flip(): void {
    this.vel = -this.body.velocity.x;
    this.body.setVelocityX(this.vel);
  }

  dieAnim(fromRight, multiplier = 1) {
    this.scene.minishake();
    this.scene.events.emit('sfx', 'enemykill');
    this.flipY = true;
    this.scene.enemyGroup.remove(this);
    this.scene.killedEnemies.add(this);
    this.body.setVelocityY(Phaser.Math.Between(-100, -250));
    this.body.setVelocityX((fromRight ? -100 : 100) * multiplier);
    this.body.setAngularVelocity(Phaser.Math.Between(100, 1000));
    this.killAt = 2000;
  }

  kill() {
    this.scene.killedEnemies.remove(this);
    this.scene.physics.world.disable(this);
    this.destroy();
  }

}

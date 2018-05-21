import { CrateboxScene } from 'cratebox/cratebox.scene';

export class BigEnemy extends Phaser.GameObjects.Sprite {
  scene: CrateboxScene;
  body: Phaser.Physics.Arcade.Body;

  dir: number;
  health = 12;

  isFirst = true;
  falling = false;
  killAt: number = 0;

  constructor(scene, x, y, dir) {
    super(scene, x, y, 'benemies');

    this.scene.physics.world.enable(this);
    this.anims.play('bigwalk');

    this.dir = dir === 1 ? -70 : 70;

    console.log(this, this.body);
  }

  firstUpdate(): void {
    this.body.setVelocityX(this.dir).setBounce(1, 0.2).setSize(32, 32);
    // this.setDisplayOrigin(10, 10);

    this.isFirst = false;
  }

  update(time: number, delta: number) {
    if (this.isFirst) {
      this.firstUpdate();
    }

    if (this.body.onFloor() && this.falling) {
      this.scene.sys.sound.playAudioSprite('sfx', 'foley', { volume: .3 });
    }

    this.falling = this.body.velocity.y > 50;
    this.flipX = this.body.velocity.x < 0;

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
      this.dir = this.dir * 1.1;
      this.health = 6;
      this.scene.minishake();
      this.anims.play('bigwalk');
      this.scene.events.emit('sfx', 'enemyloop');
    }

  }

  damage(amount: number = 0, fromRight: boolean, multiplier = 1): void {
    // console.log('enemydmg', amount)
    this.health -= amount;
    this.setTint(Phaser.Display.Color.GetColor(255, 0, 0));
    this.setScale(1, 1);
    if (this.health <= 0) {
      this.dieAnim(fromRight, multiplier);
    } else {
      this.scene.tweens.add({
        targets: this,
        duration: 50,
        // x: this.x + 20,
        scaleY: .7,
        yoyo: true,
        onComplete: () => {
          this.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
          this.setScale(1, 1);
        }
      });
    }
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

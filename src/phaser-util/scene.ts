export class Scene extends Phaser.Scene {
  physics: Phaser.Physics.Arcade.ArcadePhysics;

  make: Phaser.GameObjects.GameObjectCreator;
  add: Phaser.GameObjects.GameObjectFactory;

  load: Phaser.Loader.LoaderPlugin;
  scene: Phaser.Scenes.ScenePlugin;
  input: Phaser.Input.InputPlugin;

  tweens: Phaser.Tweens.TweenManager;
  cameras: Phaser.Cameras.Scene2D.CameraManager;
  sound: Phaser.Sound.WebAudioSoundManager;
  anims: Phaser.Animations.AnimationManager;

  events: Phaser.Events.EventEmitter;

  constructor(config: Opt<SettingsConfig>) {
    super(config as any);
  }

  update(time: number, delta?: number): void { /* */ }

}

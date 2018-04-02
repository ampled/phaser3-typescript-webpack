/** simple utility things to make things optional where they should be  */

declare type Optional<T> = {
  [key: string]: any;
}

declare type Opt<T> = Partial<T> & Optional<T>;

type ArcadePhysics<T> = {
  // body: Phaser.Physics.Arcade.Body;
  [P in keyof T]: T[P]
}

type WithBody<T> = ArcadePhysics<T> & {
  body: Phaser.Physics.Arcade.Body | any;
}

declare interface ArcadePhysicsText extends Phaser.GameObjects.Text {
  body: Phaser.Physics.Arcade.Body
}


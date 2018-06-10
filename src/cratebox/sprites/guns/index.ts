import { Gun } from 'cratebox/sprites/guns/gun';
import { Pistol } from 'cratebox/sprites/guns/pistol';
import { Smg } from 'cratebox/sprites/guns/smg';
import { Shotgun } from 'cratebox/sprites/guns/shotgun';
import { DualPistol } from 'cratebox/sprites/guns/dualpistol';
import { Minigun } from 'cratebox/sprites/guns/minigun';
import { GrenadeLauncher } from 'cratebox/sprites/guns/grenadelauncher';
import { RocketLauncher } from 'cratebox/sprites/guns/rocketlauncher';
import { Revolver } from 'cratebox/sprites/guns/revolver';
import { FryingPan } from 'cratebox/sprites/guns/fryingpan';
import { Mines } from 'cratebox/sprites/guns/mines';
import { DiscGun } from 'cratebox/sprites/guns/discgun';
import { Flamethrower } from 'cratebox/sprites/guns/flamethrower';
import { LaserGun } from 'cratebox/sprites/guns/lasergun';

export const DefaultGun = Pistol;

export const guns: Array<typeof Gun> = [
  Pistol,
  Revolver,
  DualPistol,
  Smg,
  Shotgun,
  Minigun,
  GrenadeLauncher,
  RocketLauncher,
  FryingPan,
  Mines,
  DiscGun,
  Flamethrower,
  LaserGun
];

export * from './gun';
export * from './gunfactory';
export * from './pistol';
export * from './smg';
export * from './minigun';
export * from './shotgun';
export * from './dualpistol';

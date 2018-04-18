import { Gun } from 'cratebox/sprites/guns/gun';
import { Pistol } from 'cratebox/sprites/guns/pistol';
import { Smg } from 'cratebox/sprites/guns/smg';
import { Shotgun } from 'cratebox/sprites/guns/shotgun';
import { DualPistol } from 'cratebox/sprites/guns/dualpistol';
import { Minigun } from 'cratebox/sprites/guns/minigun';

export const DefaultGun = Pistol;

export const guns: Array<typeof Gun> = [
  Pistol,
  DualPistol,
  Smg,
  Shotgun,
  Minigun
];

export * from './gun';
export * from './gunfactory';
export * from './pistol';
export * from './smg';
export * from './minigun';
export * from './shotgun';
export * from './dualpistol';

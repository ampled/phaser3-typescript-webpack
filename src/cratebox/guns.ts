export interface GunConfig {
  name: string;
  key: string;
  cooldown: number;
  projectile: ProjectileConfig;
  recoilAmount: number;
}

export interface ProjectileConfig {
  velocity: number;
  size: number;
  gravity: boolean;
  amount: number;
  key: string;
}

export const defaultProjectile: ProjectileConfig = {
  velocity: 600,
  size: 10,
  gravity: false,
  amount: 1,
  key: 'projectile'
};

export const guns: GunConfig[] = [
  {
    name: 'pistol',
    key: 'gun',
    cooldown: 300,
    recoilAmount: 200,
    projectile: defaultProjectile
  }
];

export class Gun {
  constructor(private config: GunConfig) { }
}

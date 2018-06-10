export enum EnemySpawn {
  BIG = 'BIG',
  NORMAL = 'NORMAL',
  DRONE = 'DRONE',
  NORMALDUO = 'NORMALDUO',
  NORMALWAVE = 'NORMALWAVE',
  NONE = 'NONE'
}

const dif1 = [
  { weight: .7, event: EnemySpawn.NORMAL },
  { weight: .2, event: EnemySpawn.NORMALDUO },
  { weight: .1, event: EnemySpawn.DRONE }
];

const dif2 = [
  { weight: .5, event: EnemySpawn.NORMAL },
  { weight: .2, event: EnemySpawn.NORMALDUO },
  { weight: .1, event: EnemySpawn.DRONE },
  { weight: .2, event: EnemySpawn.BIG }
];

const dif3 = [
  { weight: .4, event: EnemySpawn.NORMAL },
  { weight: .1, event: EnemySpawn.NORMALDUO },
  { weight: .1, event: EnemySpawn.NORMALWAVE },
  { weight: .3, event: EnemySpawn.BIG },
  { weight: .1, event: EnemySpawn.DRONE }
];

const dif4 = [
  { weight: .3, event: EnemySpawn.NORMAL },
  { weight: .1, event: EnemySpawn.NORMALWAVE },
  { weight: .35, event: EnemySpawn.BIG },
  { weight: .15, event: EnemySpawn.DRONE }
];

const dif5 = [
  { weight: .25, event: EnemySpawn.NORMALDUO },
  { weight: .25, event: EnemySpawn.NORMALWAVE },
  { weight: .25, event: EnemySpawn.BIG },
  { weight: .25, event: EnemySpawn.DRONE }
];

const test = [
  { weight: 1, event: EnemySpawn.NORMALWAVE }
];

export const difficulties = {
  0: dif1,
  1: dif2,
  2: dif3,
  3: dif4,
  4: dif5,
  5: test
};

export function getRandomEnemySpawnEvent(diff): EnemySpawn {
  const dif = difficulties[diff];
  const num = Math.random();
  let s = 0;
  const lastIndex = dif.length - 1;

  for (let i = 0; i < lastIndex; ++i) {
    s += dif[i].weight;
    if (num < s) {
      return dif[i].event;
    }
  }

  return dif[lastIndex].event;
}

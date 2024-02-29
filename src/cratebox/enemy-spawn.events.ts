export enum EnemySpawn {
  BIG = 'BIG',
  NORMAL = 'NORMAL',
  DRONE = 'DRONE',
  NORMALDUO = 'NORMALDUO',
  NORMALWAVE = 'NORMALWAVE',
  NONE = 'NONE',
}

const dif0 = [{ weight: 1, event: EnemySpawn.NORMAL }];

const dif1 = [
  { weight: 0.7, event: EnemySpawn.NORMAL },
  { weight: 0.2, event: EnemySpawn.NORMALDUO },
  { weight: 0.1, event: EnemySpawn.DRONE },
];

const dif2 = [
  { weight: 0.5, event: EnemySpawn.NORMAL },
  { weight: 0.2, event: EnemySpawn.NORMALDUO },
  { weight: 0.1, event: EnemySpawn.DRONE },
  { weight: 0.2, event: EnemySpawn.BIG },
];

const dif3 = [
  { weight: 0.4, event: EnemySpawn.NORMAL },
  { weight: 0.1, event: EnemySpawn.NORMALDUO },
  { weight: 0.1, event: EnemySpawn.NORMALWAVE },
  { weight: 0.3, event: EnemySpawn.BIG },
  { weight: 0.1, event: EnemySpawn.DRONE },
];

const dif4 = [
  { weight: 0.3, event: EnemySpawn.NORMAL },
  { weight: 0.1, event: EnemySpawn.NORMALWAVE },
  { weight: 0.35, event: EnemySpawn.BIG },
  { weight: 0.15, event: EnemySpawn.DRONE },
];

const dif5 = [
  { weight: 0.25, event: EnemySpawn.NORMALDUO },
  { weight: 0.25, event: EnemySpawn.NORMALWAVE },
  { weight: 0.25, event: EnemySpawn.BIG },
  { weight: 0.25, event: EnemySpawn.DRONE },
];

const test = [{ weight: 1, event: EnemySpawn.NORMALWAVE }];

export const difficultyLevel = {
  0: dif0,
  1: dif1,
  2: dif2,
  3: dif3,
  4: dif4,
  5: dif5,
  6: test,
};

export type DifficultyLevel = keyof typeof difficultyLevel;

export function getRandomEnemySpawnEvent(diff: keyof typeof difficultyLevel): EnemySpawn {
  const dif = difficultyLevel[diff];
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

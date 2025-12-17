import * as migration_20251107_183848_initial from './20251107_183848_initial';
import * as migration_20251213_005949 from './20251213_005949';

export const migrations = [
  {
    up: migration_20251107_183848_initial.up,
    down: migration_20251107_183848_initial.down,
    name: '20251107_183848_initial',
  },
  {
    up: migration_20251213_005949.up,
    down: migration_20251213_005949.down,
    name: '20251213_005949'
  },
];

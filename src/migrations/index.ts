import * as migration_20260918_151419_initial from './20260918_151419_initial';
import * as migration_20261111_135150 from './20261111_135150';

export const migrations = [
  {
    up: migration_20260918_151419_initial.up,
    down: migration_20260918_151419_initial.down,
    name: '20260918_151419_initial',
  },
  {
    up: migration_20261111_135150.up,
    down: migration_20261111_135150.down,
    name: '20261111_135150'
  },
];

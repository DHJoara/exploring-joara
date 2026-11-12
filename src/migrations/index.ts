import * as migration_virtual_artifacts from './20261112_160000_rename_virtual_artifacts';
import * as migration_20260918_151419_initial from './20260918_151419_initial';
import * as migration_20261111_135150 from './20261111_135150';
import * as migration_20261111_183833_consolidate_photos from './20261111_183833_consolidate_photos';
import * as migration_20261111_224300_home_card_images from './20261111_224300_home_card_images';
import * as migration_20261112_153451_split_site_images from './20261112_153451_split_site_images';

export const migrations = [
  {
    up: migration_20260918_151419_initial.up,
    down: migration_20260918_151419_initial.down,
    name: '20260918_151419_initial',
  },
  {
    up: migration_20261111_135150.up,
    down: migration_20261111_135150.down,
    name: '20261111_135150',
  },
  {
    up: migration_20261111_183833_consolidate_photos.up,
    down: migration_20261111_183833_consolidate_photos.down,
    name: '20261111_183833_consolidate_photos',
  },
  {
    up: migration_20261111_224300_home_card_images.up,
    down: migration_20261111_224300_home_card_images.down,
    name: '20261111_224300_home_card_images',
  },
  {
    up: migration_20261112_153451_split_site_images.up,
    down: migration_20261112_153451_split_site_images.down,
    name: '20261112_153451_split_site_images'
  },
  { up: migration_virtual_artifacts.up, down: migration_virtual_artifacts.down, name: '20261112_160000_rename_virtual_artifacts' },
];

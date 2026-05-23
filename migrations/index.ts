import * as migration_20260523_015106_add_tag_editorial_fields from './20260523_015106_add_tag_editorial_fields';
import * as migration_9999999999999_remap_tag_categories from './9999999999999_remap_tag_categories';

export const migrations = [
  {
    up: migration_20260523_015106_add_tag_editorial_fields.up,
    down: migration_20260523_015106_add_tag_editorial_fields.down,
    name: '20260523_015106_add_tag_editorial_fields',
  },
  {
    up: migration_9999999999999_remap_tag_categories.up,
    down: migration_9999999999999_remap_tag_categories.down,
    name: '9999999999999_remap_tag_categories'
  },
];

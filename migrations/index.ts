import * as migration_20260523_015106_add_tag_editorial_fields from './20260523_015106_add_tag_editorial_fields';
import * as migration_20260607_210245_add_tag_icon from './20260607_210245_add_tag_icon';
import * as migration_20260609_025613_add_catalog_sequence from './20260609_025613_add_catalog_sequence';
import * as migration_9999999999999_remap_tag_categories from './9999999999999_remap_tag_categories';

export const migrations = [
  {
    up: migration_20260523_015106_add_tag_editorial_fields.up,
    down: migration_20260523_015106_add_tag_editorial_fields.down,
    name: '20260523_015106_add_tag_editorial_fields',
  },
  {
    up: migration_20260607_210245_add_tag_icon.up,
    down: migration_20260607_210245_add_tag_icon.down,
    name: '20260607_210245_add_tag_icon',
  },
  {
    up: migration_20260609_025613_add_catalog_sequence.up,
    down: migration_20260609_025613_add_catalog_sequence.down,
    name: '20260609_025613_add_catalog_sequence',
  },
  {
    up: migration_9999999999999_remap_tag_categories.up,
    down: migration_9999999999999_remap_tag_categories.down,
    name: '9999999999999_remap_tag_categories'
  },
];

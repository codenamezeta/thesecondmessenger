import * as migration_20260523_015106_add_tag_editorial_fields from './20260523_015106_add_tag_editorial_fields';
import * as migration_20260606_235959_add_tags_icon_column from './20260606_235959_add_tags_icon_column';
import * as migration_20260607_210245_add_tag_icon from './20260607_210245_add_tag_icon';
import * as migration_20260609_025613_add_catalog_sequence from './20260609_025613_add_catalog_sequence';
import * as migration_20260614_195448_add_playlist_display_order from './20260614_195448_add_playlist_display_order';
import * as migration_20260622_203817_add_member_profile_and_multiformat_master from './20260622_203817_add_member_profile_and_multiformat_master';
import * as migration_9999999999999_remap_tag_categories from './9999999999999_remap_tag_categories';

export const migrations = [
  {
    up: migration_20260523_015106_add_tag_editorial_fields.up,
    down: migration_20260523_015106_add_tag_editorial_fields.down,
    name: '20260523_015106_add_tag_editorial_fields',
  },
  {
    up: migration_20260606_235959_add_tags_icon_column.up,
    down: migration_20260606_235959_add_tags_icon_column.down,
    name: '20260606_235959_add_tags_icon_column',
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
    up: migration_20260614_195448_add_playlist_display_order.up,
    down: migration_20260614_195448_add_playlist_display_order.down,
    name: '20260614_195448_add_playlist_display_order',
  },
  {
    up: migration_20260622_203817_add_member_profile_and_multiformat_master.up,
    down: migration_20260622_203817_add_member_profile_and_multiformat_master.down,
    name: '20260622_203817_add_member_profile_and_multiformat_master',
  },
  {
    up: migration_9999999999999_remap_tag_categories.up,
    down: migration_9999999999999_remap_tag_categories.down,
    name: '9999999999999_remap_tag_categories'
  },
];

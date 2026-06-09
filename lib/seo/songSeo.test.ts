import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildClassification,
  normalizeTagline,
  truncateAtWord,
} from './songCopyComposer'
import {
  buildSongMetaDescription,
  buildSongPageTitle,
} from './songToMetaDescription'

test('buildClassification avoids genre stutter', () => {
  const result = buildClassification({
    moods: ['Energetic'],
    subGenres: ['Hard Rock'],
    genres: ['Rock'],
    defaultGenre: 'Rock',
  })
  assert.match(result, /energetic hard rock track/)
  assert.doesNotMatch(result, /rock rock/)
})

test('normalizeTagline strips trailing punctuation and caps length', () => {
  assert.equal(normalizeTagline('Hook line!!!'), 'Hook line')
  const long =
    'This is an intentionally long tagline that should not consume the entire meta description budget'
  const capped = normalizeTagline(long, 40)
  assert.ok(capped)
  assert.ok(capped.length <= 40)
  assert.match(capped, /…$/)
})

test('buildSongMetaDescription weaves activities and influences', () => {
  const description = buildSongMetaDescription({
    title: 'Signal Fire',
    moods: ['Energetic'],
    subGenres: ['Pop-punk'],
    genres: ['Rock'],
    activities: ['Running'],
    influences: ['Blink-182'],
  })

  assert.match(description, /Signal Fire is an energetic pop-punk rock track/)
  assert.match(description, /Perfect for running/)
  assert.match(description, /For fans of Blink-182/)
  assert.ok(description.length <= 155)
})

test('buildSongMetaDescription includes featured artists', () => {
  const description = buildSongMetaDescription({
    title: 'Guest Track',
    genres: ['Rock'],
    featuredArtists: ['Jane Doe'],
  })

  assert.match(description, /by The Second Messenger feat\. Jane Doe/)
})

test('buildSongPageTitle adds feat suffix when guests are present', () => {
  assert.equal(
    buildSongPageTitle('Collab', ['Jane Doe', 'John Smith']),
    'Collab (feat. Jane Doe and John Smith) | The Second Messenger',
  )
})

test('truncateAtWord shortens without splitting words when possible', () => {
  const source =
    'Signal Fire is an energetic pop-punk rock track by The Second Messenger featuring electric guitar.'
  const truncated = truncateAtWord(source, 60)
  assert.ok(truncated.length <= 60)
  assert.match(truncated, /…$/)
})

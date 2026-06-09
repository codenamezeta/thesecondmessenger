import assert from 'node:assert/strict'
import test from 'node:test'

import { buildClassification, truncateAtWord } from './songCopyComposer'
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

test('buildSongMetaDescription weaves tag layers for search intent', () => {
  const description = buildSongMetaDescription({
    title: 'Signal Fire',
    moods: ['Energetic'],
    subGenres: ['Pop-punk'],
    genres: ['Rock'],
    production: ['Punchy'],
    themes: ['Heartbreak'],
    activities: ['Running'],
    influences: ['Blink-182'],
  })

  assert.match(description, /Signal Fire is an energetic pop-punk rock track/)
  assert.match(description, /with punchy production/)
  assert.match(description, /exploring themes of heartbreak/)
  assert.match(description, /Perfect for running/)
  assert.ok(description.length <= 155)
})

test('buildSongMetaDescription uses secondary genres and instruments when space allows', () => {
  const description = buildSongMetaDescription({
    title: 'Signal Fire',
    moods: ['Energetic'],
    subGenres: ['Pop-punk'],
    genres: ['Rock', 'Alternative'],
    instruments: ['Electric Guitar'],
  })

  assert.match(description, /blending alternative/)
  assert.match(description, /featuring electric guitar/)
})

test('buildSongMetaDescription includes featured artists', () => {
  const description = buildSongMetaDescription({
    title: 'Guest Track',
    genres: ['Rock'],
    featuredArtists: ['Jane Doe'],
  })

  assert.match(description, /by The Second Messenger feat\. Jane Doe/)
})

test('buildSongMetaDescription includes technical metadata when present', () => {
  const description = buildSongMetaDescription({
    title: 'Tempo Track',
    genres: ['Rock'],
    bpm: 128,
    key: 'A minor',
  })

  assert.match(description, /128 BPM, A minor/)
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

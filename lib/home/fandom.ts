/**
 * Curated fan comments for the Fandom (social proof) section, selected per
 * the redesign spec from `docs/Community-Comments.json`.
 *
 * EXCLUDED by spec (authenticity): @KellyZetaGonzalez (the artist's wife)
 * and @michaelzeta5423 (the artist himself).
 */

export type FandomSource = 'YouTube' | 'Reddit' | 'Fender'

export interface FandomComment {
  author: string
  quote: string
  videoTitle: string
  source: FandomSource
  /** Verifiable source link — quietly kills the "he faked these" doubt. */
  href: string
}

const YT_CHANNEL = 'https://youtube.com/@thesecondmessenger'

/** 2–3 detailed reviews featured prominently (bigger boxes, depth). */
export const ANCHOR_REVIEWS: FandomComment[] = [
  {
    // THE crown jewel — biggest box. Rebuts "can a solo indie artist
    // actually produce quality?"
    author: 'Ste (Tato-SU)',
    quote:
      'What a rich and beautifully crafted song! The arrangement is full but linear, everything well thought through. Guitars, bass, drums, vocals: all in their right place. The mix feels deep and immersive, it really draws you in. Beautiful harmonies throughout. Great song, well done!',
    videoTitle: 'Interstellar Love Song',
    source: 'Fender',
    href: 'https://my.fender.com/community/post/dV8e672UNu2YfgiO6J6F',
  },
  {
    author: '@tauron1',
    quote: "Easily the best cover I've heard so far on YT.",
    videoTitle: 'Sick Of Myself (cover)',
    source: 'YouTube',
    href: YT_CHANNEL,
  },
  {
    // Reframes the small audience as "criminally underrated."
    author: '@TheFunnyCave',
    quote: "That was a great cover! You deserve way more views than you're getting.",
    videoTitle: 'Sick Of Myself (cover)',
    source: 'YouTube',
    href: YT_CHANNEL,
  },
]

/** Short punchy grid — volume + energy. */
export const GRID_REVIEWS: FandomComment[] = [
  {
    author: '@vador329',
    quote: 'Wow more of this please, this is a straight up banger 🔥',
    videoTitle: 'The Fool',
    source: 'YouTube',
    href: YT_CHANNEL,
  },
  {
    author: '@deneicy',
    quote:
      'Driving drums and bass. Love the vocals. Belongs on a teen soundtrack!',
    videoTitle: 'Kelly Come Home',
    source: 'YouTube',
    href: YT_CHANNEL,
  },
  {
    author: '@jamesstone9140',
    quote: 'Hard to sing with just a guitar and sound this good!',
    videoTitle: 'Sick Of Myself (cover)',
    source: 'YouTube',
    href: YT_CHANNEL,
  },
  {
    author: 'jcpmuzik',
    quote: 'mad respect for the craft on this one 🎶🎹',
    videoTitle: 'The Fool',
    source: 'Reddit',
    href: 'https://www.reddit.com/r/PromoteYourMusic/comments/1uws0h9/comment/oyisltj',
  },
  {
    author: '@diesalwater1923',
    quote: 'Bravo guys. This was very pleasant to listen to. Brought me back',
    videoTitle: 'The Fool',
    source: 'YouTube',
    href: YT_CHANNEL,
  },
  {
    author: '@adamwavemusic',
    quote: "Yeah man I love your vibe, don't stop",
    videoTitle: 'Kelly Come Home',
    source: 'YouTube',
    href: YT_CHANNEL,
  },
  {
    author: 'Strong_Literature321',
    quote: 'This is INSANE GREAT JOB',
    videoTitle: "Stacy's Mom (cover)",
    source: 'Reddit',
    href: 'https://www.reddit.com/r/PromoteYourMusic/comments/1uws0h9/comment/oyisltj',
  },
]

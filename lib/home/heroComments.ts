/**
 * Ambient "peeking" comments floated behind the artist PNG in the hero halo.
 * Atmosphere, not foreground text — low opacity, slightly blurred, desktop only.
 *
 * Chosen from `docs/Community-Comments.json` for specificity/emotion, and
 * deliberately distinct from the Fandom section picks so the same quote never
 * appears twice on the page. Wife/self accounts excluded per spec.
 */

export interface HeroComment {
  author: string
  quote: string
}

export const HERO_COMMENTS: HeroComment[] = [
  {
    author: '@WonderSuper40',
    quote:
      'Bravo Sir Bravo... I would love to listen to the 2nd verse in your voice...that is my most favorite part ❤️',
  },
  {
    author: '@californiafied',
    quote: 'Certified banger 🔥',
  },
  {
    author: '@kassidymiller3223',
    quote:
      'That was great... You could sing there and get lots of subs for your channel~',
  },
]

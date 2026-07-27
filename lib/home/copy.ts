/**
 * Verbatim homepage copy from `docs/Homepage Redesign — Cursor Build Spec.md`.
 *
 * LOCKED: do not paraphrase or "improve" any string in this file without
 * sign-off from the artist. Presentation is flexible; the words are not.
 */

// ---------------------------------------------------------------------------
// Section 1 — Hero
// ---------------------------------------------------------------------------

export const HERO = {
  headline: "Songs You Can't Shake.",
  subheadline:
    "Independent rock with the hooks, harmonies, and melodies that stick with you long after the last note. Every song is written, played, and produced by hand by people who actually give a damn. No algorithms, no label, no AI. If you miss the kind of music you can sing along to, you're home.",
  secondaryCta: 'Join the Crew',
  /** First two words render bold; `rest` follows in regular weight. */
  valueChecks: [
    {
      lead: '100% human-made.',
      rest: 'No AI, ever. Real instruments, real voices, real hands.',
    },
    {
      lead: 'Every genre you love.',
      rest: 'Rock, pop, acoustic, and more, all from one artist worth following.',
    },
    {
      lead: 'Made to be heard.',
      rest: "Foreground music with details you'll still catch on the tenth listen.",
    },
    {
      lead: 'Straight from the artist.',
      rest: 'No label, no gatekeepers. Leave a comment, the actual musician answers.',
    },
    {
      lead: 'Your voice counts.',
      rest: 'Vote on mixes, lyrics, and what comes next. You help shape the music.',
    },
  ],
} as const

// ---------------------------------------------------------------------------
// Section 2 — Music
// ---------------------------------------------------------------------------

export const MUSIC = {
  eyebrow: '// THE CATALOG',
  heading: 'Hit play and follow your ears.',
  subheading:
    "Start here. When you're hooked, there's plenty more where this came from.",
  exploreCta: 'Hear Everything',
} as const

// ---------------------------------------------------------------------------
// Section 3 — PAS / The Alternative
// ---------------------------------------------------------------------------

export const PAS = {
  eyebrow: '// THE PROBLEM',
  heading: "Name the last song you couldn't shake.",
  subheading: 'Not background noise. Not algorithm filler. A song that stuck.',
  /** In the subheading above, "stuck" renders italic per the spec. */
  problem:
    "Think about it for a second. The last song that genuinely grabbed you, that you played on repeat again and again - on purpose. A song you still catch yourself humming months later. Getting harder to name one, isn't it? That's not your imagination, and it's not your fault. The industry figured out that forgettable is profitable, and that a song just trendy enough to stream and just bland enough to ignore prints money on repeat. So that's what fills the feeds now: an endless drip of music engineered to never quite make you feel anything.",
  agitation:
    "And now it's getting worse. The feeds are flooding with AI-generated tracks, songs no human ever wrote, sang, or felt, pumped out by the thousands to farm streams. You genuinely can't tell what's real anymore. And even when you do find something you like, the artist is a faceless brand three layers removed from you. You post your comment into the void. Nobody's on the other end. To them, you were never a fan. You were a metric.",
  solution: {
    eyebrow: '// THE SIGNAL',
    heading: "That's exactly why The Second Messenger exists.",
    body: "I'm a real person who writes, plays, and produces every song by hand, no AI, no label, no committee trimming off the parts that actually hit. I make foreground music: songs built to be listened to, not ignored. Songs with hooks that lodge in your skull and details you'll still be discovering on the tenth spin. And when you show up, I'm actually here. Leave a comment and it's me who answers, not a bot, not an intern. This isn't a content factory. It's one stubborn human making music worth a damn, for people who still give a damn.",
    /** "listened to" renders italic per the spec. */
    cta: { label: 'Explore the Lore', href: '/bio' },
  },
} as const

// ---------------------------------------------------------------------------
// Section 4 — Benefits
// ---------------------------------------------------------------------------

export const BENEFITS = {
  eyebrow: '// WHY IT HITS DIFFERENT',
  heading: 'More than music. A whole lot more.',
  items: [
    {
      icon: 'headphones',
      title: 'I make music that actually moves you.',
      body: 'Every track is hook-forward, instrument-driven, and built with intention. No filler, no fads, and no corporate "polish" sanding away the good parts. Just songs I crafted to stick with you.',
    },
    {
      icon: 'speech',
      title: 'I actually talk back.',
      body: "No label, no manager, no wall. Leave a comment and the person who wrote the song is the one who reads it, me. Our community is strong. You're not a metric here - you're part of the conversation.",
    },
    {
      icon: 'fader',
      title: 'You help shape what I make next.',
      body: "Vote on alternate mixes, lyric choices, and upcoming releases. This isn't a passive listen, it's a dynamic and evolving project you get to influence. Your taste leaves a mark on the music.",
    },
  ],
} as const

// ---------------------------------------------------------------------------
// Section 5 — Backstage Pass
// ---------------------------------------------------------------------------

export const BACKSTAGE = {
  eyebrow: '// CLEARANCE PROTOCOL — 3 STEPS',
  heading: 'The Backstage Pass',
  subheading: "From first listen to inner circle. Here's how you get in.",
  steps: [
    {
      num: '01',
      title: 'Hit Play',
      body: 'Dive into the catalog. No account, no paywall, no algorithm deciding for you. Just press play and hear what sticks.',
      cta: { label: 'Start Listening', href: '/music' },
    },
    {
      num: '02',
      title: 'Join the Crew',
      body: 'Create a free account to follow along, get new releases in your inbox, and jump into the community. Free MP3 downloads included, on the house.',
      cta: { label: 'Create Free Account', href: '/register' },
    },
    {
      num: '03',
      title: 'Take the Helm',
      body: 'Upgrade to a paid tier to unlock the Vault (demos, stems, alt mixes), vote on what comes next, and get real influence over the music. This is where fans become collaborators.',
      cta: { label: 'See Membership Tiers', href: '/memberships' },
    },
  ],
} as const

// ---------------------------------------------------------------------------
// Section 6 — Fandom
// ---------------------------------------------------------------------------

export const FANDOM = {
  eyebrow: '// SIGNAL INTERCEPTS',
  heading: 'The Fandom',
  subtitle:
    'Others have already crossed the expanse. These are their transmissions.',
} as const

// ---------------------------------------------------------------------------
// Section 7 — Features
// ---------------------------------------------------------------------------

export const FEATURES = {
  eyebrow: '// SYSTEM SPECS',
  heading: 'The Continuing Mission',
  subheading: 'The music is the mission. The community is the purpose.',
  groups: [
    {
      title: 'The Music',
      items: [
        '20+ original songs, and growing.',
        '100% human-made: real instruments, real vocals, zero AI.',
        'Studio-quality production, written, played, mixed by the artist.',
        'Genre-spanning: rock, pop, acoustic, alternative, and more.',
        'Singles-focused, every track gets full attention, no filler.',
        'Never buys playlist placement, every listen is earned.',
      ],
    },
    {
      title: 'The Access',
      items: [
        'Free MP3 downloads with a free account.',
        'High-res FLAC/WAV downloads for members.',
        'The Vault: demos, alt mixes, stems, DI tracks, synth patches, sheet music.',
        'Sonic Time-Lapse checkpoint mixdowns.',
        'Fly-on-the-Wall production breakdowns.',
      ],
    },
    {
      title: 'The Community',
      items: [
        'Direct artist access, the musician actually replies.',
        'Voting rights on mixes, lyrics, and upcoming releases.',
        'Forum access to connect with other fans.',
        'Profile badges and rank insignia (Ensign → Captain).',
        'Members-only perks: merch discounts, liner-note credits, and exclusive care packages.',
      ],
    },
  ],
} as const

// ---------------------------------------------------------------------------
// Section 8 — FAQ
// ---------------------------------------------------------------------------

export const FAQ = {
  eyebrow: '// THE DEBRIEF',
  heading: "Questions? I've got you.",
  items: [
    {
      q: "Is this actually free? What's the catch?",
      a: 'Yep, actually free. Hit play and listen to the whole catalog, no account, no card, no catch. Make a free account and you even get MP3 downloads on the house. The paid tiers exist for folks who want to go deeper (the Vault, voting, all that), but the music itself? Always free to hear.',
      cta: { label: 'Create a Free Account', href: '/register' },
    },
    {
      q: "I've never heard of you. Why should I trust the music is any good?",
      a: "Fair. So don't take my word for it, take 30 seconds and press play. That's my whole pitch. If a song doesn't grab you, you've lost half a minute. If it does, well, that's kind of the point.",
    },
    {
      q: 'Is any of this AI-generated?',
      a: "Not a note. Not a lyric. Not a single stem. Every song is written, played, and recorded by real humans (mostly me, sometimes with people I trust). In a feed full of AI slop, that's the whole promise: this is real, made by hand, and it always will be.",
    },
    {
      q: 'Do you actually read comments, or is that just a line?',
      a: "I actually read them. And reply. It's genuinely me, not a bot or a social media manager. Drop a good idea in there and don't be surprised if it ends up in the next mix.",
    },
    {
      q: 'What do I get if I pay? Is it worth it?',
      a: "Depends how deep you want in. Free gets you every song. Paying unlocks the Vault (demos, stems, alt mixes, sheet music), voting rights on what I release next, and a real say in the project. If you just want the tunes, stay free forever, no hard feelings. If you want to help shape them, that's what the tiers are for.",
      cta: { label: 'See Membership Tiers', href: '/memberships' },
    },
    {
      q: 'Do I have to be some kind of music nerd to enjoy this?',
      a: "Nope. If you like a song you can sing along to, you're the target audience. The deep stuff (stems, production breakdowns, the lore) is there if you want to geek out, but it's totally optional. Come for the catchy songs, stay for the... whatever you're into.",
    },
    {
      q: 'Why come here instead of just using Spotify or Bandcamp?',
      a: "Honestly? Because this is the source. You'll find everything here first, often before it hits anywhere else, plus the extras you can't get on a streaming platform: the stems, the demos, the story behind each song, and a direct line to me. Streaming pays artists in fractions of pennies and treats you like a data point. Here, your support goes straight to the music, and you're an actual part of it. Same songs, way more everything.",
      cta: { label: 'Start Listening', href: '/music' },
    },
  ],
} as const

// ---------------------------------------------------------------------------
// Section 9 — Email signup bar
// ---------------------------------------------------------------------------

export const EMAIL_BAR = {
  heading: 'Not ready to commit? Get new releases in your inbox.',
  button: 'Keep Me Posted',
} as const

// ---------------------------------------------------------------------------
// Section 10 — Final CTA
// ---------------------------------------------------------------------------

export const FINAL_CTA = {
  headline: "Ready to hear something you can't shake?",
  secondaryCta: 'Join the Crew',
} as const

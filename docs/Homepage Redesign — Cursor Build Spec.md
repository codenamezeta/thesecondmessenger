# Homepage Redesign — Cursor Build Spec

> **Purpose:** This is the master brief for the TSM Website homepage redesign. It's written to be handed to the Cursor AI agent so it understands the full picture (section order, copy, layout, and the reasoning behind each choice) before writing any code. We refine this as we lock each section. When it's complete, it doubles as the build prompt and the rationale record.

> **Aesthetic (applies throughout):** "Secure Data Terminal." Sharp edges, structural borders, grid layouts, deep dark ambient space, subtle glass-morphism, film-grain/scanline texture, glowing accent gradients. Typography as a weapon: large tight-tracked fonts for impact, legible sans for reading, wide-tracked monospace for HUD elements (timestamps, file names, status codes). Avoid soft/rounded/friendly shapes.

---

## Core Messaging (the North Star)

The single most important message: **The Second Messenger makes genuinely great, memorable, 100% human-made music, and there's a real person behind it who's actually reachable.** Everything else (lore, sci-fi aesthetic) is a _wrapper_ for this core message, not the message itself.

**Primary transformation we sell:** songs that stick with you (not disposable background noise).

**Ideal listener:** millennials and Gen Z who love catchy, singable rock/pop and adjacent genres; people who like discovering indie artists and freshening up their library; people who value real, human-made craft over algorithmic/AI filler.

---

## Final Section Order

A deliberate persuasion arc: **hook → sample → problem → solution → benefits → how-to → proof → logic → ask.**

1. **Hero** — hook, value prop, value checks, CTA pair, social proof hint
2. **Music** — mixed content feed (releases + videos + posts); show, don't tell
3. **PAS / The Alternative** — problem → agitate → solution reveal
4. **Benefits** — the 3 things the listener gets
5. **Backstage Pass (3-step)** — the path from listener to member
6. **Fandom (social proof)** — proof it's true, right before the ask
7. **Features** — logic backup for analytical buyers
8. **FAQ (Debrief)** — clear final objections
9. **Email signup bar** — slim, low-commitment catch for the "not yet" crowd
10. **Final CTA** — stacked pair under "Ready to hear something you can't shake?"

**Changes from current live order:** PAS moved up (was #5); social proof moved down to just before the ask (was #3); standalone video section cut (folds into Music); email signup moved from dangling bottom to a deliberate slim bar before the final CTA.

---

## Section 1 — Hero

**Headline:** Songs You Can't Shake.

**Subheadline:** Independent rock with the hooks, harmonies, and melodies that stick with you long after the last note. Every song is written, played, and produced by hand by people who actually give a damn. No algorithms, no label, no AI. If you miss the kind of music you can sing along to, you're home.

**Primary CTA:** Dynamic rotating button (or some kind of selection interface) — **Play something...** cycling _Catchy · Upbeat · Ambient · Mellow · Heavy · Recent_ (lead with Catchy). Clicking starts playback immediately. Users can also pick a category before pressing play.

**Secondary CTA:** **Join the Crew** → subscriptions signup page (`/memberships`).

**Value checks** (use checkmark ✓ icons; keep top 3 on mobile):

- ✓ **100% human-made.** No AI, ever. Real instruments, real voices, real hands.
- ✓ **Every genre you love.** Rock, pop, acoustic, and more, all from one artist worth following.
- ✓ **Made to be heard.** Foreground music with details you'll still catch on the tenth listen.
- ✓ **Straight from the artist.** No label, no gatekeepers. Leave a comment, the actual musician answers.
- ✓ **Your voice counts.** Vote on mixes, lyrics, and what comes next. You help shape the music.

**Hero image:** Refined cutout of the artist with guitar against the dark circular halo. Elevate production: dramatic single-source lighting, deep shadow, confident posture. The artist IS the product.

**Social proof hint:** 2-3 ambient peeking YouTube comments floated behind the artist PNG in the halo negative space. Low opacity / slightly blurred (atmosphere, not foreground text). Pick specific, emotional comments (not generic praise). Consider possibly making them desktop only/hidden on mobile if too cluttered on small screens. NO subscriber count, NO fanned avatars (real specific comments beat a small number). You can find usable comments from [[Community Comments]] JSON document.

---

## Section 2 — Music

**Intent:** Show, don't tell. Drop visitors straight into the catalog (90% of non-bouncers want the music first). More layout/behavior than copy.

**EYEBROW:** `// THE CATALOG`

**HEADING:** Hit play and follow your ears.

**SUBHEADING:** Start here. When you're hooked, there's plenty more where this came from.

**Featured item:** First slot is always the hero of the section, either the most recent release OR an upcoming one being hyped. When there's a scheduled premiere, show a countdown. Biggest box, special treatment (glowing border, larger art, more metadata visible). This is what returning fans come back for. Featured slot stays FIXED (not randomized).

**Card behavior (the 3 requirements):**

1. **Metadata to spark curiosity:** title, a genre/mood tag or two, plus something intriguing (BPM or a one-line hook). Enough to make them wonder what it sounds like.
2. **Instant play:** a play button on the card triggers the global player, no navigation.
3. **View more:** card body or a "details" link routes to the song's full page.

**Mixed content feed:** Cards can be songs, videos, or posts, distinguished by a small type tag (`♪ TRACK`, `▶ VIDEO`, `✎ POST`). This replaces a standalone video section (video lives here). NOTE for Cursor: requires the data model to support mixed content types (flagged as its own Phase 3 build task). For v1, gracefully handle songs-only and layer in video/posts as the backend catches up.

**Randomization:** Non-featured cards randomize each visit so the page feels alive on repeat visits and encourages re-exploration. Featured slot stays fixed.

**Mobile fix (the big complaint):** Featured item spans 2 columns; everything else drops to 1 column. Kills the too-much-scrolling problem on mobile while keeping the bento look on desktop.

**Explore button:** Renamed from "Explore full music database" (too techy/cold) to **"Hear Everything →"**. Make it visually pop (accent color, not a ghost button). Routes to /music.

---

## Section 3 — PAS / The Alternative

**Ranked pain points** (felt listener pains, not insider musician critiques):

1. It's all disposable background noise. _(Problem)_
2. AI slop is flooding everything. _(Agitation)_
3. No connection to the artist. _(Agitation, bridges to membership)_

**Layout:** Eyebrow + heading, then two columns (channel-trailer video left; Problem + Agitation paragraphs right, Problem bold and slightly larger), then a full-width "sparkly"/special Solution reveal with an artist image and secondary CTA to `/bio`.

**EYEBROW:** `// THE PROBLEM`

**HEADING:** Name the last song you couldn't shake.

**SUBHEADING:** Not background noise. Not algorithm filler. A song that _stuck_.

**PROBLEM** _(bold, slightly larger):_

> Think about it for a second. The last song that genuinely grabbed you, that you played on repeat again and again - on purpose. A song you still catch yourself humming months later. Getting harder to name one, isn't it? That's not your imagination, and it's not your fault. The industry figured out that forgettable is profitable, and that a song just trendy enough to stream and just bland enough to ignore prints money on repeat. So that's what fills the feeds now: an endless drip of music engineered to never quite make you feel anything.

**AGITATION** _(regular weight):_

> And now it's getting worse. The feeds are flooding with AI-generated tracks, songs no human ever wrote, sang, or felt, pumped out by the thousands to farm streams. You genuinely can't tell what's real anymore. And even when you do find something you like, the artist is a faceless brand three layers removed from you. You post your comment into the void. Nobody's on the other end. To them, you were never a fan. You were a metric.

**SOLUTION REVEAL** _(full-width, visually special, artist photo):_

**EYEBROW:** `// THE SIGNAL`

**HEADING:** That's exactly why The Second Messenger exists.

> I'm a real person who writes, plays, and produces every song by hand, no AI, no label, no committee trimming off the parts that actually hit. I make foreground music: songs built to be _listened to_, not ignored. Songs with hooks that lodge in your skull and details you'll still be discovering on the tenth spin. And when you show up, I'm actually here. Leave a comment and it's me who answers, not a bot, not an intern. This isn't a content factory. It's one stubborn human making music worth a damn, for people who still give a damn.

**SECONDARY CTA:** Explore the Lore → /bio

**Video note:** An edgier alternate version of this copy is being adapted into a spoken video script for the channel-trailer slot (delivered aloud, the extra edge lands better than in text; also satisfies the "add video for conversion" guideline). On-page text stays the warm version above.

---

## Section 4 — Benefits

**Intent:** Name the 3 things the fan GETS. Rule: benefit in the headline (emotional result), feature in the explanation (the mechanism). Kept separate from the Backstage Pass (Benefits = what you get; Backstage = how you get it).

**Voice:** First person throughout. Benefits is the emotional differentiator section and the whole point is "there's a real human here," so the artist's voice reinforces it. (Contrast: the Features section stays neutral/third person for the dry logic list.)

**Icons:** Default to literal and warm (headphones, speech bubble, fader), over sci-fi HUD glyphs when possible. Benefits is the emotional section, so friendly icons serve it better than terminal styling.

**EYEBROW:** `// WHY IT HITS DIFFERENT`

**HEADING:** More than music. A whole lot more.

**Benefit 1 🎧 — I make music that actually moves you.**

> Every track is hook-forward, instrument-driven, and built with intention. No filler, no fads, and no corporate "polish" sanding away the good parts. Just songs I crafted to stick with you.

**Benefit 2 💬 — I actually talk back.**

> No label, no manager, no wall. Leave a comment and the person who wrote the song is the one who reads it, me. Our community is strong. You're not a metric here - you're part of the conversation.

**Benefit 3 🎚️ — You help shape what I make next.**

> Vote on alternate mixes, lyric choices, and upcoming releases. This isn't a passive listen, it's a dynamic and evolving project you get to influence. Your taste leaves a mark on the music.

**Note:** Benefit 2 deliberately echoes the PAS payoff ("you're not a metric here") so the page feels authored, not assembled.

---

## Section 5 — Backstage Pass (3-step)

**Intent:** A crystal-clear path from casual listener to member. Layered typography (massive faint 01/02/03 numbers behind the text). Three cards, each with title + description + CTA. Escalation ladder: free listen → free account → paid membership. This is the natural home for introducing memberships (a placement I was previously unsure about).

**Voice/style:** Punchy, plain verbs (not full terminal). Warmer and clearer. Titles use the naval/crew theme that ties to the Ensign/Lieutenant/Captain tiers.

**EYEBROW:** `// CLEARANCE PROTOCOL — 3 STEPS`

**HEADING:** The Backstage Pass

**SUBHEADING:** From first listen to inner circle. Here's how you get in.

`**01**` **— Hit Play**

> Dive into the catalog. No account, no paywall, no algorithm deciding for you. Just press play and hear what sticks.

> **CTA:** Start Listening → `/music`

`**02**` **— Join the Crew**

> Create a free account to follow along, get new releases in your inbox, and jump into the community. Free MP3 downloads included, on the house.

> **CTA:** Create Free Account → `/register`

`**03**` **— Take the Helm**

> Upgrade to a paid tier to unlock the Vault (demos, stems, alt mixes), vote on what comes next, and get real influence over the music. This is where fans become collaborators.

> **CTA:** See Membership Tiers → `/memberships`

**Escalation logic:** Step 1 = zero friction (no signup, just listen). Step 2 = free account (email capture + free MP3, the conversion funnel from the Memberships notes). Step 3 = the paid ask (Vault, voting, collaboration). "Take the Helm" chosen over "Take the Wheel" for the naval/crew tie-in (a captain takes the helm).

---

## Section 6 — Fandom (social proof)

**Intent:** Prove the claims are true right before the ask. Frame real fan comments as "intercepted transmissions / system logs" with terminal-style `[ ★★★★★ ]` brackets and metadata (author handle, source, video title) to fit the aesthetic.

**Suggested layout: hybrid.** 2-3 detailed "anchor" reviews featured prominently (bigger boxes, prove quality in depth) surrounded by a grid of short punchy ones (volume + energy = "a crowd already loves this"). Total ~10.

**Authenticity treatment:** Include a small avatar and a small "via YouTube / Reddit / Fender" source link on each. With a small subscriber base, verifiable realness is the edge, links quietly kill the "he faked these" doubt. Keep small so they don't clutter the terminal aesthetic. Sourcing across YouTube + Reddit + Fender is itself a signal (praise from everywhere, not one fanbase).

**EXCLUDED (do not use):** @KellyZetaGonzalez (the artist's wife) and @michaelzeta5423 (the artist himself). Featuring these would torpedo the section's authenticity.

**HEADING:** The Fandom

**EYEBROW:** `// SIGNAL INTERCEPTS`

### Anchor reviews (feature prominently, detailed)

**Ste (Tato-SU)** · via Fender · _Interstellar Love Song_ — THE crown jewel; give it the biggest box. Rebuts the "can a solo indie artist actually produce quality?" objection.

> "What a rich and beautifully crafted song! The arrangement is full but linear, everything well thought through. Guitars, bass, drums, vocals: all in their right place. The mix feels deep and immersive, it really draws you in. Beautiful harmonies throughout. Great song, well done!"

**@tauron1** · via YouTube · _Sick Of Myself (cover)_

> "Easily the best cover I've heard so far on YT."

**@TheFunnyCave** · via YouTube · _Sick Of Myself (cover)_ — reframes the small audience as "criminally underrated."

> "That was a great cover! You deserve way more views than you're getting."

### Short grid (volume + energy)

- **@vador329** · YouTube · _The Fool_ — "Wow more of this please, this is a straight up banger 🔥"
- **@deneicy** · YouTube · _Kelly Come Home_ — "Driving drums and bass. Love the vocals. Belongs on a teen soundtrack!"
- **@jamesstone9140** · YouTube · _Sick Of Myself (cover)_ — "Hard to sing with just a guitar and sound this good!"
- **jcpmuzik** · Reddit · _The Fool_ — "mad respect for the craft on this one 🎶🎹"
- **@diesalwater1923** · YouTube · _The Fool_ — "Bravo guys. This was very pleasant to listen to. Brought me back"
- **@adamwavemusic** · YouTube · _Kelly Come Home_ — "Yeah man I love your vibe, don't stop"
- **Strong_Literature321** · Reddit · _Stacy's Mom (cover)_ — "This is INSANE GREAT JOB"

**Bench (swap-ins if more volume wanted):** @californiafied ("Certified banger 🔥"), @GoDodgers513 ("Awesome song Michael 🔥"), @rosiesullivan9150 ("Killin' it!"), @harlangrayson4868 ("Love it.!"), @WonderSuper40, @kassidymiller3223, @BurnTheYearbookUK, @DefinitelyNOTLofee.

---

## Section 7 — Features

**Intent:** Logic backup for analytical buyers. Grid/checklist with icons. Terminal/HUD aesthetic fits here. This is where the insider differentiators cut from PAS finally live, plus membership perks.

**Voice:** Neutral / third person (contrast to the first-person Benefits section). Fast, scannable facts.

**Tier-gating approach:** List what EXISTS in the world, do NOT spell out which tier gets what. Features proves the universe is rich; the /memberships page handles the who-gets-what breakdown. (Naming tiers/percentages here would turn an impressive scan into "wait, which do I actually get?" — a question we want asked on /memberships, which drives clicks there.)

**Grouping:** 16 items in 3 buckets (Music / Access / Community) that subtly map to the three Benefit pillars (great music → connection → influence) for page cohesion. Try to match heights across columns / horizontal space, avoid orphans.

**EYEBROW:** `// SYSTEM SPECS`

**HEADING:** The Fine Print (the good kind)

**SUBHEADING:** Everything you get, laid out plain.

**THE MUSIC**

- ✓ 20+ original songs, and growing.
- ✓ 100% human-made: real instruments, real vocals, zero AI.
- ✓ Studio-quality production, written, played, mixed by the artist.
- ✓ Genre-spanning: rock, pop, acoustic, alternative, and more.
- ✓ Singles-focused, every track gets full attention, no filler.
- ✓ Never buys playlist placement, every listen is earned.

**THE ACCESS**

- ✓ Free MP3 downloads with a free account.
- ✓ High-res FLAC/WAV downloads for members.
- ✓ The Vault: demos, alt mixes, stems, DI tracks, synth patches, sheet music.
- ✓ Sonic Time-Lapse checkpoint mixdowns.
- ✓ Fly-on-the-Wall production breakdowns.

**THE COMMUNITY**

- ✓ Direct artist access, the musician actually replies.
- ✓ Voting rights on mixes, lyrics, and upcoming releases.
- ✓ Forum access to connect with other fans.
- ✓ Profile badges and rank insignia (Ensign → Captain).
- ✓ Members-only perks: merch discounts, liner-note credits, and exclusive care packages.

**Note:** Song count (20) is exact and accurate as of lock date; "and growing" covers future additions without hardcoding a number that goes stale.

---

## Section 8 — FAQ (Debrief)

**Intent:** Handle final objections (not just questions) right before the close. Expandable data-panel accordions (query-the-database feel). Casual, warm, trusted-friend voice with a little humor.

**CTA approach:** Add CTAs ONLY to the questions where a next step naturally follows (price/trust reassurance → account, payment question → memberships, streaming comparison → listen). Leave the pure-reassurance ones (trust, AI, comments, music-nerd) CTA-free so the buttoned ones feel intentional, not spammy.

**EYEBROW:** `// THE DEBRIEF`

**HEADING:** Questions? I've got you.

**Q: Is this actually free? What's the catch?**

> Yep, actually free. Hit play and listen to the whole catalog, no account, no card, no catch. Make a free account and you even get MP3 downloads on the house. The paid tiers exist for folks who want to go deeper (the Vault, voting, all that), but the music itself? Always free to hear.

> **CTA:** Create a Free Account → `/register`

**Q: I've never heard of you. Why should I trust the music is any good?**

> Fair. So don't take my word for it, take 30 seconds and press play. That's my whole pitch. If a song doesn't grab you, you've lost half a minute. If it does, well, that's kind of the point.

**Q: Is any of this AI-generated?**

> Not a note. Not a lyric. Not a single stem. Every song is written, played, and recorded by real humans (mostly me, sometimes with people I trust). In a feed full of AI slop, that's the whole promise: this is real, made by hand, and it always will be.

**Q: Do you actually read comments, or is that just a line?**

> I actually read them. And reply. It's genuinely me, not a bot or a social media manager. Drop a good idea in there and don't be surprised if it ends up in the next mix.

**Q: What do I get if I pay? Is it worth it?**

> Depends how deep you want in. Free gets you every song. Paying unlocks the Vault (demos, stems, alt mixes, sheet music), voting rights on what I release next, and a real say in the project. If you just want the tunes, stay free forever, no hard feelings. If you want to help shape them, that's what the tiers are for.

> **CTA:** See Membership Tiers → `/memberships`

**Q: Do I have to be some kind of music nerd to enjoy this?**

> Nope. If you like a song you can sing along to, you're the target audience. The deep stuff (stems, production breakdowns, the lore) is there if you want to geek out, but it's totally optional. Come for the catchy songs, stay for the... whatever you're into.

**Q: Why come here instead of just using Spotify or Bandcamp?**

> Honestly? Because this is the source. You'll find everything here first, often before it hits anywhere else, plus the extras you _can't_ get on a streaming platform: the stems, the demos, the story behind each song, and a direct line to me. Streaming pays artists in fractions of pennies and treats you like a data point. Here, your support goes straight to the music, and you're an actual part of it. Same songs, way more everything.

> **CTA:** Start Listening → `/music`

---

## Section 9 — Email signup bar

**Intent:** Slim, low-commitment catch for people who read all the way down but aren't ready to become a member. Two fields. Complements (doesn't cannibalize) the membership CTA. Placed just before the Final CTA.

**HEADING:** Not ready to commit? Get new releases in your inbox.

**FIELDS:** email (+ optional name), single button.

**BUTTON:** Keep Me Posted

Keep it visually quiet relative to the Final CTA so it reads as a secondary, lower-stakes option.

---

## Section 10 — Final CTA

**Layout:** Stacked pair under a closing headline, wrapped in the most intense/atmospheric background on the page.

**HEADLINE:** Ready to hear something you can't shake?

**BUTTONS:** the exact **Play something...** button (primary) beside **Join the Crew** (secondary escalation).

Bookends the hero headline ("Songs You Can't Shake.") for a unified open/close. Play button keeps them listening; Join the Crew pushes commitment now that they've scrolled the whole page.

---

## Out of scope for this homepage build

Memberships/payments/backend work (payment flow bug, download rework, account UX, Payload/ID3 tagging) is a **separate workstream** and intentionally excluded here so the redesign isn't blocked by unrelated backend bugs.
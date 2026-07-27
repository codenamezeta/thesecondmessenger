'use client'

import dynamic from 'next/dynamic'
import { HeroSection } from './sections/HeroSection'
import type { HomeProps } from './homeSectionTypes'

export type { SongPreview, PremiereTeaser, HomeProps } from './homeSectionTypes'

const HomeSectionsBelowHeroDynamic = dynamic(
  () =>
    import('./HomeSectionsBelowHero').then((mod) => mod.HomeSectionsBelowHero),
  {
    ssr: true,
    loading: () => <div className="min-h-96" aria-hidden />,
  },
)

/**
 * LOCKED section order (persuasion arc — see the redesign spec):
 * Hero → Music → PAS → Benefits → Backstage Pass → Fandom → Features →
 * FAQ → Email bar → Final CTA.
 */
export function HomeSections({
  songs,
  videos,
  premiere,
  categoryQueues,
}: HomeProps) {
  return (
    <article className="relative bg-transparent">
      <HeroSection songs={songs} categoryQueues={categoryQueues} />
      <HomeSectionsBelowHeroDynamic
        songs={songs}
        videos={videos}
        premiere={premiere}
        categoryQueues={categoryQueues}
      />
    </article>
  )
}

'use client'

import { MusicSection } from './sections/MusicSection'
import { PasSection } from './sections/PasSection'
import { BenefitsSection } from './sections/BenefitsSection'
import { BackstageSection } from './sections/BackstageSection'
import { FandomSection } from './sections/FandomSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { FaqSection } from './sections/FaqSection'
import { EmailBar } from './sections/EmailBar'
import { FinalCtaSection } from './sections/FinalCtaSection'
import type { HomeProps } from './homeSectionTypes'

function Divider() {
  return <div className="border-t border-border/20" />
}

/** Sections 2–10 of the LOCKED order (hero renders eagerly upstream). */
export function HomeSectionsBelowHero({
  songs,
  videos,
  premiere,
  categoryQueues,
}: HomeProps) {
  return (
    <>
      <Divider />
      <MusicSection songs={songs} videos={videos} premiere={premiere} />
      <Divider />
      <PasSection />
      <Divider />
      <BenefitsSection />
      <Divider />
      <BackstageSection />
      <Divider />
      <FandomSection />
      <Divider />
      <FeaturesSection />
      <Divider />
      <FaqSection />
      <EmailBar />
      <FinalCtaSection songs={songs} categoryQueues={categoryQueues} />
    </>
  )
}

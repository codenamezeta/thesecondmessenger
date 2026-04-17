import type { Metadata } from 'next'
import Link from 'next/link'

import {
  LegalLayout,
  LegalSection,
  LegalSubsection,
} from '@/components/Legal/LegalLayout'
import { CONTACT_EMAIL, POLICY_LAST_UPDATED } from '@/components/Legal/constants'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Terms of Service | The Second Messenger',
    description:
      'The legal agreement governing your use of The Second Messenger, the Crew membership program, and any content you download from the Vault.',
    robots: { index: true, follow: true },
  }
}

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      eyebrow="// Ship's Articles"
      title="Terms of Service"
      lastUpdated={POLICY_LAST_UPDATED}
      intro={
        <>
          These Terms of Service (the &ldquo;<strong>Terms</strong>&rdquo;)
          govern your access to and use of The Second Messenger website,
          Crew membership program, forum, Vault, and any related services
          (collectively, the &ldquo;<strong>Service</strong>&rdquo;). The
          Service is operated by an independent sole-proprietor artist doing
          business as &ldquo;The Second Messenger.&rdquo; By creating an
          account or otherwise using the Service you agree to these Terms.
          If you do not agree, do not use the Service. Questions can be sent
          to{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </>
      }
    >
      <LegalSection id="eligibility" number="01" title="Eligibility & Accounts">
        <LegalSubsection title="A. Who may use the Service">
          <p>
            You must be at least 13 years old (or the minimum digital-consent
            age in your jurisdiction, whichever is greater) to create an
            account. If you are under 18, you represent that you have a
            parent or legal guardian&rsquo;s permission to use the Service
            and to enter into these Terms. By using the Service you also
            represent that you are not on any government denied-party,
            embargo, or sanctions list.
          </p>
        </LegalSubsection>

        <LegalSubsection title="B. Account security">
          <p>
            You are responsible for maintaining the confidentiality of your
            credentials and for all activity that occurs under your account.
            Pick a strong, unique password. Notify us immediately at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            if you suspect unauthorized access. We are not liable for losses
            caused by unauthorized use that results from your failure to keep
            your credentials secure.
          </p>
        </LegalSubsection>

        <LegalSubsection title="C. Accurate information">
          <p>
            Account information (email, username, and, if provided, your
            name and ZIP code) must be accurate, current, and belong to you.
            Impersonation, fraudulent signups, and bulk-creation of accounts
            are prohibited. Usernames that impersonate the artist, staff, or
            third-party brands may be reclaimed at our discretion.
          </p>
        </LegalSubsection>

        <LegalSubsection title="D. Termination by us">
          <p>
            We may suspend or terminate your account, cancel your Crew
            subscription, and/or remove your content at any time if we
            reasonably believe you have violated these Terms, applicable
            law, or the rights of any third party; if required by law; or
            if continued access would create a material risk to the Service
            or other users. Where practical, we will give you notice and an
            opportunity to cure. Termination does not relieve you of amounts
            already owed.
          </p>
        </LegalSubsection>

        <LegalSubsection title="E. Termination by you">
          <p>
            You may delete your account at any time from{' '}
            <Link
              href="/account"
              className="text-primary underline-offset-4 hover:underline"
            >
              Account Settings
            </Link>
            , or by emailing{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Delete%20my%20Crew%20account`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . See the{' '}
            <Link
              href="/privacy-policy#deletion"
              className="text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>{' '}
            for exactly what is deleted and what is retained.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="acceptable-use" number="02" title="Acceptable Use">
        <p>You agree that you will not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Copy, redistribute, mirror, or scrape any portion of the Service
            except as expressly permitted by these Terms.
          </li>
          <li>
            Upload or transmit viruses, malware, or any code intended to
            disrupt the Service or other users&rsquo; equipment.
          </li>
          <li>
            Attempt to circumvent Crew rank gating, rate limiting, signed
            URLs, digital rights management, or any access-control
            mechanism.
          </li>
          <li>
            Use automated scripts, bots, or AI agents to create accounts,
            post content, inflate engagement metrics, or extract gated
            content, unless you have our prior written permission.
          </li>
          <li>
            Harass, threaten, dox, or promote violence against anyone in the
            forum, comments, or any community feature.
          </li>
          <li>
            Impersonate any person or misrepresent your affiliation with any
            person or organization.
          </li>
          <li>
            Use the Service to infringe copyright, trademark, privacy, or
            other rights belonging to us or any third party.
          </li>
          <li>
            Use the Service to train artificial intelligence or machine
            learning models, or to build a competing product, without our
            prior written consent.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="memberships-payments"
        number="03"
        title="Crew Memberships, Payments & Billing"
      >
        <LegalSubsection title="A. Crew tiers">
          <p>
            Crew ranks (Ensign, Lieutenant, Commander, Captain, and the
            invite-only Admiral) unlock different levels of access to the
            Vault, forum, voting, credits, and community features. The
            Ensign rank is free. Paid tiers are billed monthly in advance.
            Tier perks may evolve over time; we will not materially reduce
            advertised perks during a billing cycle you have already paid
            for.
          </p>
        </LegalSubsection>

        <LegalSubsection title="B. Third-party payment processing (Stripe)">
          <p>
            All payments are processed by <strong>Stripe, Inc.</strong>, our
            third-party payment processor. When you subscribe, upgrade, or
            update your card, you are redirected to Stripe-hosted pages and
            Stripe collects your payment information directly. We do not
            store raw credit-card numbers, CVCs, or full billing addresses
            on our own servers. Your use of Stripe is also governed by the{' '}
            <a
              href="https://stripe.com/legal/consumer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Stripe Services Agreement
            </a>
            .
          </p>
        </LegalSubsection>

        <LegalSubsection title="C. Renewals, changes & cancellation">
          <p>
            Paid Crew subscriptions renew automatically at the end of each
            billing period until canceled. You can cancel, upgrade, or
            downgrade at any time from <em>Manage Billing</em> in{' '}
            <Link
              href="/account"
              className="text-primary underline-offset-4 hover:underline"
            >
              Account Settings
            </Link>
            . Upgrades and downgrades use Stripe&rsquo;s standard proration
            rules. Cancellations take effect at the end of the current paid
            period; your rank downgrades to Ensign after that.
          </p>
        </LegalSubsection>

        <LegalSubsection title="D. Price changes">
          <p>
            We may change subscription prices with at least 30 days&rsquo;
            notice via email or an in-app notice. If you do not accept the
            new price you may cancel before it takes effect; continued
            subscription after the change constitutes acceptance.
          </p>
        </LegalSubsection>

        <LegalSubsection title="E. Refunds">
          <p>
            Because Crew perks (including digital downloads from the Vault)
            are generally delivered instantly, paid memberships are{' '}
            <strong>non-refundable</strong> except where required by law or
            at our sole discretion. If you believe you were charged in
            error, contact{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            within 30 days of the charge.
          </p>
        </LegalSubsection>

        <LegalSubsection title="F. Taxes">
          <p>
            Prices are quoted exclusive of applicable taxes. Stripe calculates
            and collects any sales, VAT, or GST required by your billing
            location.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        id="ip"
        number="04"
        title="Intellectual Property & Gated Vault Content"
      >
        <LegalSubsection title="A. Our rights">
          <p>
            All music, recordings, stems, sheet music, artwork, text,
            graphics, video, source code, logos, and other materials made
            available through the Service (collectively, the{' '}
            <strong>&ldquo;Artist Content&rdquo;</strong>) are owned by or
            licensed to The Second Messenger and are protected by copyright,
            trademark, and other laws. Nothing in these Terms transfers
            ownership of the Artist Content to you.
          </p>
        </LegalSubsection>

        <LegalSubsection title="B. License to you — what you can do">
          <p>
            When you are an active Crew member with the appropriate rank,
            we grant you a <strong>limited, personal, non-exclusive,
            non-transferable, non-sublicensable, revocable license</strong>{' '}
            to:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Stream the audio and video made available through the Service
              for your own personal enjoyment;
            </li>
            <li>
              Download Vault files for which you have clearance (including
              those hosted on Vercel Blob and Cloudflare R2) for your own
              personal, non-commercial use; and
            </li>
            <li>
              Create a reasonable number of personal backup copies of files
              you have downloaded.
            </li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="C. Restrictions — what you cannot do">
          <p>Unless we give you written permission in advance, you may not:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Redistribute, re-upload, share, sell, sublicense, lease, or
              rent any Artist Content &mdash; including stems, multitracks,
              MIDI, sheet music, lyrics, patches, unreleased audio, or Vault
              archives.
            </li>
            <li>
              Post Vault downloads to file-sharing sites, torrents, Discord
              servers, Telegram channels, or any public / semi-public
              repository.
            </li>
            <li>
              Incorporate Artist Content into a commercial release, NFT,
              remix for sale, sample pack, stock-music library, podcast
              theme, or background music for monetized content, without a
              separate written license.
            </li>
            <li>
              Use Artist Content to train, fine-tune, or generate outputs
              from any artificial intelligence or machine learning model.
            </li>
            <li>
              Reverse engineer, decompile, or circumvent DRM, signed-URL
              expiry, watermarks, or rank-based access controls.
            </li>
            <li>
              Claim Artist Content as your own on YouTube Content ID,
              SoundExchange, any PRO/CMO, or any monetization platform.
            </li>
          </ul>
          <p>
            Remixes, covers, fan edits, and non-commercial transformative
            works shared on your personal social accounts are generally
            welcome &mdash; tag us &mdash; but do not grant you ownership
            of the underlying Artist Content.
          </p>
        </LegalSubsection>

        <LegalSubsection title="D. Feedback">
          <p>
            If you send us ideas, feedback, or suggestions, you grant us a
            perpetual, royalty-free, worldwide license to use them without
            obligation to you.
          </p>
        </LegalSubsection>

        <LegalSubsection title="E. Trademarks">
          <p>
            &ldquo;The Second Messenger,&rdquo; the Crew rank insignia, and
            associated logos and wordmarks are trademarks of the artist. You
            may not use them without prior written permission except for
            fair, non-endorsing references.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="user-content" number="05" title="User Content & Community Conduct">
        <LegalSubsection title="A. Your content">
          <p>
            The Service lets you submit content &mdash; forum posts, comments,
            replies, avatars, bios, presave data, and YouTube comments you
            post through our connected-account flow (collectively,{' '}
            <strong>&ldquo;User Content&rdquo;</strong>). You retain
            ownership of your User Content.
          </p>
        </LegalSubsection>

        <LegalSubsection title="B. License you grant us">
          <p>
            By posting User Content, you grant us a worldwide,
            non-exclusive, royalty-free, sublicensable license to host,
            store, reproduce, display, distribute, and adapt that User
            Content as needed to operate and promote the Service. This
            license ends when you or we delete the User Content from the
            Service, except for copies kept in backups until they expire in
            the ordinary course and uses of content you have already made
            public (for example, quoting your comment in a blog post).
          </p>
        </LegalSubsection>

        <LegalSubsection title="C. Your representations">
          <p>
            You represent that you own or have all necessary rights to your
            User Content; that it does not infringe any third-party rights;
            and that it complies with these Terms and applicable law.
          </p>
        </LegalSubsection>

        <LegalSubsection title="D. Moderation">
          <p>
            We may review, edit, or remove User Content at our discretion,
            but we are not obligated to monitor it. We are not responsible
            for User Content posted by other users.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="third-party-services" number="06" title="Third-Party Services">
        <p>
          The Service integrates with third-party services including Google
          (YouTube Data API v3), Spotify, Stripe, Cloudflare, and Vercel.
          Your use of these integrations is also governed by each
          provider&rsquo;s own terms and privacy policy, including the{' '}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            YouTube Terms of Service
          </a>{' '}
          and the{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Google Privacy Policy
          </a>
          . When you connect your Google account to perform YouTube actions
          on our site (liking, commenting, subscribing), you agree to
          YouTube&rsquo;s Terms of Service and acknowledge that you can
          revoke our access at any time through your{' '}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Google Security Settings
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="dmca" number="07" title="Copyright Claims (DMCA)">
        <p>
          We respect the intellectual-property rights of others. If you
          believe User Content on the Service infringes your copyright, send
          a written notice to{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=DMCA%20Notice`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          that includes: (1) identification of the copyrighted work; (2) the
          specific URL of the allegedly infringing material; (3) your
          contact information; (4) a statement of good-faith belief that
          the use is unauthorized; (5) a statement under penalty of perjury
          that the information is accurate and you are authorized to act;
          and (6) your physical or electronic signature. Counter-notices
          can be sent to the same address.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" number="08" title="Disclaimers">
        <p className="uppercase">
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available,&rdquo; without warranties of any kind, whether express,
          implied, statutory, or otherwise, including any implied warranties
          of merchantability, fitness for a particular purpose,
          non-infringement, title, availability, or accuracy of content. We
          do not warrant that the Service will be uninterrupted, secure, or
          error-free, or that any defects will be corrected.
        </p>
        <p>
          You use the Service at your own risk. You are responsible for
          maintaining your own backups of any Vault downloads important to
          you; files may be removed, re-encoded, or replaced at any time.
        </p>
      </LegalSection>

      <LegalSection id="liability" number="09" title="Limitation of Liability">
        <p className="uppercase">
          To the maximum extent permitted by applicable law, in no event
          will The Second Messenger or its operator be liable for any
          indirect, incidental, special, consequential, exemplary, or
          punitive damages, or for any loss of profits, revenues, data,
          goodwill, or other intangible losses, arising out of or relating
          to your use of (or inability to use) the Service.
        </p>
        <p className="uppercase">
          Our aggregate liability for any claim arising out of or relating
          to these Terms or the Service is limited to the greater of (a)
          the amounts you paid to us in the twelve (12) months before the
          event giving rise to the claim, or (b) one hundred U.S. dollars
          ($100 USD).
        </p>
        <p>
          Some jurisdictions do not allow the exclusion or limitation of
          certain damages; in those jurisdictions the above limitations
          apply only to the maximum extent permitted.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" number="10" title="Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless The Second
          Messenger, its operator, and its collaborators from any claim,
          loss, liability, damage, or expense (including reasonable
          attorneys&rsquo; fees) arising out of or related to (a) your User
          Content, (b) your use of the Service, (c) your violation of these
          Terms, or (d) your violation of any right of a third party.
        </p>
      </LegalSection>

      <LegalSection id="law" number="11" title="Governing Law & Dispute Resolution">
        <p>
          These Terms are governed by the laws of the United States and,
          where federal law does not apply, the laws of the state in which
          the artist primarily resides, without regard to conflict-of-law
          principles. To the extent permitted by law, you and we agree
          that any dispute arising out of or relating to these Terms or
          the Service will be resolved through binding, individual
          arbitration, and both parties waive the right to a jury trial and
          to participate in any class or representative action. You may opt
          out of arbitration by emailing{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Arbitration%20opt-out`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          within 30 days of first accepting these Terms. Notwithstanding
          the foregoing, either party may seek injunctive or equitable
          relief in a court of competent jurisdiction to protect its
          intellectual-property rights.
        </p>
      </LegalSection>

      <LegalSection id="misc" number="12" title="Changes & Miscellaneous">
        <LegalSubsection title="A. Changes to the Terms">
          <p>
            We may update these Terms from time to time. When we do, we will
            revise the &ldquo;Last updated&rdquo; date at the top and, for
            material changes, give notice through the Service or by email.
            Continued use after changes take effect means you accept the
            updated Terms.
          </p>
        </LegalSubsection>
        <LegalSubsection title="B. Entire agreement">
          <p>
            These Terms, together with the{' '}
            <Link
              href="/privacy-policy"
              className="text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            , are the entire agreement between you and us regarding the
            Service.
          </p>
        </LegalSubsection>
        <LegalSubsection title="C. Severability & waiver">
          <p>
            If any provision of these Terms is held unenforceable, the
            remaining provisions will remain in effect. Our failure to
            enforce any right is not a waiver of that right.
          </p>
        </LegalSubsection>
        <LegalSubsection title="D. Assignment">
          <p>
            You may not assign or transfer these Terms without our prior
            written consent; we may assign them in connection with a merger,
            acquisition, or sale of all or substantially all of our assets.
          </p>
        </LegalSubsection>
        <LegalSubsection title="E. Contact">
          <p>
            Legal notices should be sent to{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </LegalSubsection>
      </LegalSection>
    </LegalLayout>
  )
}

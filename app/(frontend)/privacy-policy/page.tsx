import type { Metadata } from 'next'
import Link from 'next/link'

import {
  LegalLayout,
  LegalSection,
  LegalSubsection,
} from '@/components/Legal/LegalLayout'
import {
  CONTACT_EMAIL,
  POLICY_LAST_UPDATED,
} from '@/components/Legal/constants'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Privacy Policy | The Second Messenger',
    description:
      'How The Second Messenger collects, uses, stores, shares, and deletes your data — including YouTube and Google data accessed through our Crew features.',
    robots: { index: true, follow: true },
  }
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      eyebrow="// Compliance"
      title="Privacy Policy"
      lastUpdated={POLICY_LAST_UPDATED}
      intro={
        <>
          This Privacy Policy explains what information The Second Messenger
          (&ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo;
          or &ldquo;<strong>our</strong>&rdquo;) collects from visitors and
          registered Crew members, how we use it, who we share it with, and the
          choices you have &mdash; including your right to disconnect
          third-party accounts and delete your data. The Second Messenger is a
          musical project operated by an independent sole-proprietor artist.
          Questions or requests can always be sent to{' '}
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
      <LegalSection id="summary" number="01" title="Plain-Language Summary">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            You can browse most of the site without giving us any personal
            information.
          </li>
          <li>
            When you create a Crew account we store your email, username,
            password hash, display-name preferences, and &mdash; optionally
            &mdash; your first name, last name, ZIP code, avatar, and bio.
          </li>
          <li>
            If you connect YouTube, we store the Google OAuth tokens we need to
            like videos, post comments, and manage your subscription to our
            channel at <em>your</em> request. We do not sell or share that data
            with anyone, and we do not use it to train AI models.
          </li>
          <li>
            Payments are handled by Stripe. We never see or store your raw
            credit-card number.
          </li>
          <li>
            You can disconnect YouTube, export your data, or permanently delete
            your account from your account settings at any time.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="information-we-collect"
        number="02"
        title="Information We Collect"
      >
        <LegalSubsection title="A. Information you give us directly">
          <p>
            When you register for a Crew account and use the site, we collect:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account credentials</strong> &mdash; email address and a
              hashed, salted password (we never store your password in
              plaintext).
            </li>
            <li>
              <strong>Profile information</strong> &mdash; username,
              display-name format preference, and optional first name, last
              name, ZIP code, bio, and avatar image.
            </li>
            <li>
              <strong>Communications</strong> &mdash; the content of messages,
              forum posts, comments, presave signups, and newsletter
              subscriptions you choose to submit.
            </li>
            <li>
              <strong>Payment information</strong> &mdash; collected and
              processed by Stripe on Stripe-hosted pages. We store only your
              Stripe customer ID, current Crew rank, subscription status, and
              invoice metadata returned by Stripe webhooks.
            </li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="B. Information collected automatically">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Authentication cookies</strong> set by our CMS (Payload)
              to keep you logged in, and a <code>tsm_user_id</code> identity
              cookie (up to 90 days) that remembers which presave profile
              belongs to you when you return after a Spotify handoff.
            </li>
            <li>
              <strong>Analytics and performance data</strong> collected via{' '}
              <a
                href="https://vercel.com/docs/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Vercel Analytics
              </a>{' '}
              and Vercel Speed Insights &mdash; aggregated page views, Web
              Vitals, referrers, approximate geography, and anonymized visitor
              hashes. These services do not use third-party cookies and do not
              build cross-site advertising profiles.
            </li>
            <li>
              <strong>Server logs</strong> &mdash; IP address, user-agent,
              timestamps, and request paths kept for a short period for security
              and debugging purposes.
            </li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="C. Information from third-party services">
          <p>
            If you choose to connect an external service, we receive only the
            data that service returns to us:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Google / YouTube</strong> &mdash; OAuth access token,
              refresh token, token-expiry timestamp, and (at your action) the
              channel snippet we use to render your avatar. See{' '}
              <Link
                href="#youtube-data"
                className="text-primary underline-offset-4 hover:underline"
              >
                Section 4
              </Link>{' '}
              for the full disclosure.
            </li>
            <li>
              <strong>Spotify</strong> &mdash; an anonymized Spotify user ID, a
              refresh token limited to the scopes you grant during presave, and
              your email address if you complete a presave flow.
            </li>
            <li>
              <strong>Stripe</strong> &mdash; customer ID, subscription status,
              price ID, invoice history, and the last four digits / brand of
              your payment method (for display purposes only). Stripe&rsquo;s
              privacy practices are described in the{' '}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Stripe Privacy Policy
              </a>
              .
            </li>
          </ul>
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        id="how-we-use"
        number="03"
        title="How We Use Your Information"
      >
        <p>We use the information above to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and operate your Crew account.</li>
          <li>
            Provide the features you request &mdash; playing music, unlocking
            Vault content that matches your rank, posting comments, liking
            videos, subscribing to our YouTube channel, and processing
            subscription payments.
          </li>
          <li>
            Send transactional messages (receipts, membership changes, password
            resets) and, if you opt in, newsletter and release alerts.
          </li>
          <li>
            Protect the service against fraud, abuse, and unauthorized access.
          </li>
          <li>
            Comply with legal obligations and enforce our Terms of Service.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal information. We do{' '}
          <strong>not</strong> use your YouTube or Google data to train machine
          learning models, and we do not transfer it to advertising networks or
          data brokers.
        </p>
      </LegalSection>

      <LegalSection
        id="youtube-data"
        number="04"
        title="Google API & YouTube Data Disclosure"
      >
        <p>
          The Second Messenger&rsquo;s use and transfer of information received
          from Google APIs adheres to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>

        <LegalSubsection title="A. Scopes we request">
          <p>
            When you click <em>Connect YouTube</em> we ask for one OAuth scope:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <code>https://www.googleapis.com/auth/youtube.force-ssl</code>{' '}
              &mdash; required to perform the actions you initiate from within
              our site: liking videos, posting comments and replies on our
              channel, and subscribing to (or unsubscribing from) our channel.
            </li>
          </ul>
          <p>
            We do not request <code>youtube.readonly</code>,{' '}
            <code>youtubepartner</code>, the Gmail, Drive, Calendar, Contacts,
            or any other Google scope. We do not read your private videos,
            playlists, subscriber lists, analytics, or any data outside the
            actions you trigger.
          </p>
        </LegalSubsection>

        <LegalSubsection title="B. What we access, store, and share">
          <p>Upon your authorization we receive from Google:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              A short-lived <strong>access token</strong> (~1 hour) and a{' '}
              <strong>refresh token</strong> used to obtain new access tokens.
            </li>
            <li>
              A <strong>token-expiry timestamp</strong>.
            </li>
            <li>
              When you interact with our comments UI: your public YouTube
              channel snippet (display name, profile image, channel URL) so your
              comment can render correctly.
            </li>
          </ul>
          <p>
            These tokens are stored encrypted at rest in our Vercel Postgres
            database and are only accessible to (a) our server-side
            authentication code, and (b) the authenticated user who owns them.
            They are never exposed to the browser, never sent to third parties,
            and never used for any purpose other than executing the actions you
            explicitly initiate on our site.
          </p>
          <p>
            We <strong>do not share</strong> Google user data with any third
            party. Google user data is also not used to train artificial
            intelligence or machine learning models.
          </p>
        </LegalSubsection>

        <LegalSubsection title="C. Public YouTube data used to render the site">
          <p>
            Independently of your Google account, we use a server-side YouTube
            Data API v3 key to fetch our own channel&rsquo;s public uploads
            playlist and comment threads so visitors can watch and read along.
            This request returns only public data that anyone on youtube.com can
            already see and is cached for up to one hour.
          </p>
        </LegalSubsection>

        <LegalSubsection title="D. Data retention & revocation">
          <p>
            Your Google tokens are retained only for as long as your Crew
            account is active and YouTube remains connected. You can remove them
            at any time:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Disconnect YouTube in your account</strong> &mdash; visit{' '}
              <Link
                href="/account"
                className="text-primary underline-offset-4 hover:underline"
              >
                Account Settings
              </Link>{' '}
              and use the <em>Disconnect YouTube</em> control. This immediately
              deletes your access token, refresh token, and expiry from our
              database and revokes the token with Google.
            </li>
            <li>
              <strong>Revoke access directly with Google</strong> &mdash; visit{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Google Security Settings &rarr; Third-party apps with account
                access
              </a>{' '}
              and remove &ldquo;The Second Messenger.&rdquo; Google will
              invalidate our tokens. If you don&rsquo;t also disconnect on our
              side, our next refresh attempt will fail and the connection will
              be cleared automatically.
            </li>
            <li>
              <strong>Delete your entire account</strong> (see{' '}
              <Link
                href="#deletion"
                className="text-primary underline-offset-4 hover:underline"
              >
                Section 8
              </Link>
              ) &mdash; this also revokes and purges all Google tokens.
            </li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="E. Required policy references">
          <p>
            You can review the governing policies for this integration here:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                YouTube Terms of Service
              </a>
            </li>
            <li>
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Google API Services User Data Policy
              </a>
            </li>
            <li>
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Revoke our app&rsquo;s access to your Google account
              </a>
            </li>
          </ul>
        </LegalSubsection>
      </LegalSection>

      <LegalSection
        id="cookies"
        number="05"
        title="Cookies & Similar Technologies"
      >
        <p>
          We use a small number of first-party cookies and local storage keys:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Session cookies</strong> issued by Payload CMS to keep you
            logged in. These are <code>HttpOnly</code> and{' '}
            <code>SameSite=Lax</code>.
          </li>
          <li>
            <strong>
              <code>tsm_user_id</code>
            </strong>{' '}
            &mdash; a 90-day cookie set after a Spotify presave so we can
            reconnect your browser to your presave profile on return.
          </li>
          <li>
            <strong>
              <code>yt_access_token</code>
            </strong>{' '}
            &mdash; a short-lived browser-side access token (in{' '}
            <code>localStorage</code>) used by the lightweight YouTube identity
            flow. Clearing your browser storage removes it; logging out of the
            site also clears it.
          </li>
          <li>
            <strong>Vercel Analytics / Speed Insights</strong> &mdash;
            cookieless telemetry hashed to a rotating identifier. No cross-site
            advertising profiles are created.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="third-parties"
        number="06"
        title="Third-Party Processors"
      >
        <p>
          We rely on a small number of infrastructure providers, and share only
          the data each one needs to do its job:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Vercel, Inc.</strong> &mdash; application hosting, Vercel
            Postgres database, Vercel Blob media storage, analytics. See the{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Vercel Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Cloudflare, Inc.</strong> &mdash; R2 object storage for
            large Vault downloads (stems, archives, high-res images, lossless
            audio, and video). See the{' '}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Cloudflare Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Stripe, Inc.</strong> &mdash; payment processing,
            subscription management, and customer portal. Card numbers, CVCs,
            and billing addresses are collected and stored by Stripe directly;
            we never see them. See the{' '}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Stripe Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Google LLC / YouTube LLC</strong> &mdash; OAuth identity,
            YouTube Data API v3 for both authorized write actions and
            public-channel reads.
          </li>
          <li>
            <strong>Spotify AB</strong> &mdash; presave flow and optional
            library syncing.
          </li>
        </ul>
        <p>
          We may add or substitute processors over time; material changes will
          be reflected in this policy and in the &ldquo;Last updated&rdquo;
          date.
        </p>
      </LegalSection>

      <LegalSection
        id="data-security"
        number="07"
        title="How We Protect Your Data"
      >
        <ul className="list-disc space-y-2 pl-5">
          <li>All traffic to the site is served over HTTPS with HSTS.</li>
          <li>
            Passwords are hashed and salted by Payload CMS using
            industry-standard algorithms; we never store or log raw passwords.
          </li>
          <li>
            Google OAuth tokens, Spotify refresh tokens, and Stripe identifiers
            are stored in Vercel Postgres, encrypted at rest by the provider,
            and excluded from client-readable API responses via collection-level
            access control.
          </li>
          <li>
            Gated Vault files hosted on Cloudflare R2 are served through
            short-lived (1-hour) signed URLs scoped to a single object.
          </li>
          <li>
            Access to administrative dashboards is limited to the artist and
            explicitly designated collaborators, and is protected by
            session-based authentication.
          </li>
        </ul>
        <p>
          No system is perfectly secure. If we become aware of a breach that
          affects your information, we will notify affected users and any
          applicable authorities as required by law.
        </p>
      </LegalSection>

      <LegalSection
        id="deletion"
        number="08"
        title="Your Choices, Retention & Deletion"
      >
        <LegalSubsection title="A. Data retention">
          <p>
            We retain your account data for as long as your Crew account is
            active. Aggregate, de-identified analytics may be retained
            indefinitely. Stripe invoice and tax records are retained per
            Stripe&rsquo;s own retention rules and applicable financial-records
            law (typically 7 years).
          </p>
        </LegalSubsection>

        <LegalSubsection title="B. Access, correction, and export">
          <p>
            You can view and edit most of your profile information directly from{' '}
            <Link
              href="/account"
              className="text-primary underline-offset-4 hover:underline"
            >
              Account Settings
            </Link>
            . For a machine-readable export or to request correction of data you
            cannot self-edit, contact us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            . We will respond within 30 days.
          </p>
        </LegalSubsection>

        <LegalSubsection title="C. Disconnecting third-party services">
          <p>
            Use the <em>Disconnect YouTube</em> button in{' '}
            <Link
              href="/account"
              className="text-primary underline-offset-4 hover:underline"
            >
              Account Settings
            </Link>{' '}
            to clear and revoke your Google tokens immediately. You can also
            revoke access directly through the{' '}
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
        </LegalSubsection>

        <LegalSubsection title="D. Deleting your account">
          <p>
            Deleting your account is permanent and, where possible, instant.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>In-app:</strong> open{' '}
              <Link
                href="/account"
                className="text-primary underline-offset-4 hover:underline"
              >
                Account Settings
              </Link>{' '}
              and use the <em>Delete Account</em> control at the bottom of the
              page. When confirmed, we revoke any connected Google tokens,
              cancel active Stripe subscriptions at period end (or immediately,
              your choice in the confirmation dialog), delete your user record,
              and log you out.
            </li>
            <li>
              <strong>By email:</strong> send a deletion request from the email
              address on file to{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Delete%20my%20Crew%20account`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . We will action the request within 30 days and reply with
              confirmation once complete.
            </li>
          </ul>
          <p>
            Some information must be retained after deletion for legal,
            accounting, or fraud-prevention reasons (for example, Stripe invoice
            records and minimal audit logs). We keep these records only for the
            period required and access them only as necessary.
          </p>
        </LegalSubsection>

        <LegalSubsection title="E. Opting out of marketing">
          <p>
            Every marketing email we send includes an unsubscribe link. You can
            also email{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            with the subject &ldquo;unsubscribe.&rdquo; Transactional messages
            (receipts, security notices) cannot be opted out of without closing
            your account.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="children" number="09" title="Children's Privacy">
        <p>
          The Second Messenger is not directed to children under 13 (or the
          equivalent minimum age in your jurisdiction, such as 16 in parts of
          the EEA). We do not knowingly collect personal information from
          children. If you believe a child has created an account, contact us at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          and we will delete the account.
        </p>
      </LegalSection>

      <LegalSection id="international" number="10" title="International Users">
        <p>
          The service is operated from the United States. By using the site you
          understand that your data will be transferred to and processed in the
          United States and in the regions where our infrastructure providers
          (Vercel, Cloudflare, Stripe, Google) operate. Where required,
          transfers rely on Standard Contractual Clauses or other lawful
          transfer mechanisms maintained by those providers.
        </p>
      </LegalSection>

      <LegalSection
        id="regional"
        number="11"
        title="Regional Rights (GDPR / CCPA)"
      >
        <p>
          If you are in the European Economic Area, the United Kingdom, or
          California, you may have additional rights including access,
          rectification, erasure, restriction, portability, objection, and the
          right to lodge a complaint with a supervisory authority. You can
          exercise any of these rights by contacting{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          . We do not sell personal information, so there is nothing to opt out
          of under the California &ldquo;Do Not Sell&rdquo; right.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="12" title="Changes to This Policy">
        <p>
          We may update this policy from time to time. When we do, we will
          revise the &ldquo;Last updated&rdquo; date at the top. For material
          changes affecting how we use your data, we will also notify Crew
          members by email or through a prominent notice in Account Settings.
          Continued use of the service after a change means you accept the
          updated policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="13" title="Contact Us">
        <p>
          Data-protection inquiries, deletion requests, and general legal
          questions can be sent to{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Loader2, ShieldOff, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notifyAuthChanged } from '@/components/Nav/AdminBar'

function parseError(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as { error?: string }
  return typeof data.error === 'string' ? data.error : null
}

type Props = {
  youtubeConnected: boolean
  hasActiveSubscription: boolean
}

export function AccountDataAndPrivacy({
  youtubeConnected,
  hasActiveSubscription,
}: Props) {
  const router = useRouter()

  const [disconnecting, setDisconnecting] = useState(false)
  const [disconnectMessage, setDisconnectMessage] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)

  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [cancelImmediately, setCancelImmediately] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const disconnectYouTube = async () => {
    setDisconnectMessage(null)
    setDisconnecting(true)
    try {
      const res = await fetch('/api/auth/youtube/disconnect', {
        method: 'POST',
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(parseError(data) ?? 'Could not disconnect YouTube.')
      }
      setDisconnectMessage({
        type: 'success',
        text: 'YouTube disconnected. Your Google tokens have been revoked and deleted.',
      })
      router.refresh()
    } catch (e: unknown) {
      setDisconnectMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Something went wrong.',
      })
    } finally {
      setDisconnecting(false)
    }
  }

  const deleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDeleteError(null)

    if (confirmText !== 'DELETE') {
      setDeleteError('Type DELETE exactly to confirm.')
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: 'DELETE',
          cancelSubscriptionImmediately: cancelImmediately,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(parseError(data) ?? 'Could not delete your account.')
      }

      notifyAuthChanged()
      window.location.assign('/?account=deleted')
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Something went wrong.')
      setDeleting(false)
    }
  }

  return (
    <section className="mt-10 space-y-6 border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:p-8">
      <div className="space-y-2">
        <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
          {'// Data & Privacy'}
        </p>
        <h2 className="font-heading text-xl tracking-tight text-foreground uppercase md:text-2xl">
          Your data, your controls
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Disconnect connected services or permanently delete your Crew account.
          See the{' '}
          <Link
            href="/privacy-policy#deletion"
            className="text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>{' '}
          for exactly what is deleted and what is retained.
        </p>
      </div>

      <div className="space-y-3 border border-border/50 bg-background/30 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              YouTube / Google connection
            </p>
            <p className="text-sm text-foreground">
              {youtubeConnected
                ? 'YouTube is connected. Disconnecting revokes our access token with Google and deletes it from our database.'
                : 'No YouTube / Google tokens stored. You can reconnect YouTube from the section above at any time.'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-none"
            disabled={!youtubeConnected || disconnecting}
            onClick={disconnectYouTube}
          >
            {disconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting…
              </>
            ) : (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Disconnect YouTube
              </>
            )}
          </Button>
        </div>
        {disconnectMessage && (
          <p
            className={
              disconnectMessage.type === 'error'
                ? 'text-sm font-semibold text-destructive'
                : 'text-sm font-semibold text-primary'
            }
          >
            {disconnectMessage.text}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          You can also revoke access directly in your{' '}
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
      </div>

      <div className="space-y-4 border border-destructive/40 bg-destructive/5 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 flex-none text-destructive"
            aria-hidden
          />
          <div className="space-y-1">
            <p className="font-mono text-[10px] tracking-[0.2em] text-destructive uppercase">
              Danger zone
            </p>
            <h3 className="font-heading text-base tracking-tight text-foreground uppercase">
              Delete your account
            </h3>
            <p className="text-sm text-muted-foreground">
              This permanently removes your user record, avatar, bio,
              display-name settings, YouTube connection, and Crew rank. Stripe
              invoice history and minimal audit logs are retained as described
              in the Privacy Policy. This action cannot be undone.
            </p>
          </div>
        </div>

        {!showDeleteForm ? (
          <Button
            type="button"
            variant="destructive"
            className="rounded-none"
            onClick={() => setShowDeleteForm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete my account
          </Button>
        ) : (
          <form onSubmit={deleteAccount} className="space-y-4">
            {hasActiveSubscription && (
              <label className="flex items-start gap-2 border border-border/50 bg-background/40 p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={cancelImmediately}
                  onChange={(e) => setCancelImmediately(e.target.checked)}
                  disabled={deleting}
                />
                <span className="text-muted-foreground">
                  Cancel my paid subscription <strong>immediately</strong>. If
                  unchecked, the subscription is scheduled to cancel at the end
                  of the current billing period and you keep paid access until
                  then.
                </span>
              </label>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm">
                Type <span className="font-mono text-destructive">DELETE</span>{' '}
                to confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="rounded-none"
                disabled={deleting}
                autoComplete="off"
              />
            </div>

            {deleteError && (
              <p className="text-sm font-semibold text-destructive">
                {deleteError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                variant="destructive"
                className="rounded-none"
                disabled={deleting || confirmText !== 'DELETE'}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Permanently delete account'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={deleting}
                onClick={() => {
                  setShowDeleteForm(false)
                  setConfirmText('')
                  setCancelImmediately(false)
                  setDeleteError(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

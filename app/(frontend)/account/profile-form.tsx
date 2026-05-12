'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import type { User } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type AccountProfileInitialData = {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  zipCode: string
  bio: string
  displayNameFormat: User['displayNameFormat']
  crewRank: User['crewRank']
  role: User['role']
  youtubeConnected: boolean
  avatarId: number | null
  avatarUrl: string | null
  avatarAlt: string
}

const MAX_AVATAR_BYTES = 1024 * 1024
const MAX_BIO_LENGTH = 500

const DISPLAY_NAME_OPTIONS: Array<{
  value: User['displayNameFormat']
  label: string
}> = [
  { value: 'username', label: 'Username (e.g. "spacedrifter")' },
  {
    value: 'rank_username',
    label: 'Rank + Username (e.g. "Commander spacedrifter")',
  },
  { value: 'firstName', label: 'First name' },
  { value: 'lastName', label: 'Last name' },
  { value: 'fullName', label: 'Full name' },
  { value: 'rank_firstName', label: 'Rank + First name' },
  { value: 'rank_lastName', label: 'Rank + Last name' },
  { value: 'rank_fullName', label: 'Rank + Full name' },
]

type ValidationErrors = Partial<
  Record<
    'username' | 'email' | 'zipCode' | 'bio' | 'displayNameFormat' | 'avatar',
    string
  >
>

type ProfileFormBaseline = Pick<
  AccountProfileInitialData,
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'zipCode'
  | 'bio'
  | 'displayNameFormat'
  | 'avatarId'
>

function baselineFromInitial(
  data: AccountProfileInitialData,
): ProfileFormBaseline {
  return {
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    zipCode: data.zipCode,
    bio: data.bio,
    displayNameFormat: data.displayNameFormat,
    avatarId: data.avatarId,
  }
}

function SaveProfileSubmitButton({
  isSaving,
  disabled,
  className,
}: {
  isSaving: boolean
  disabled: boolean
  className?: string
}) {
  return (
    <Button type="submit" disabled={disabled || isSaving} className={className}>
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        'Save Changes'
      )}
    </Button>
  )
}

function parsePayloadError(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null

  const data = payload as {
    errors?: Array<{ message?: string }>
    message?: string
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0]?.message
    if (firstError) return firstError
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message
  }

  return null
}

function validateForm(values: {
  username: string
  email: string
  zipCode: string
  bio: string
  avatarFile: File | null
}): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!values.username) {
    errors.username = 'Username is required.'
  } else if (!/^[a-z0-9_]{3,24}$/i.test(values.username)) {
    errors.username =
      'Username must be 3-24 characters and use only letters, numbers, or underscores.'
  }

  if (!values.email) {
    errors.email =
      'Email is required so you can log in and receive account notices.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address (example: you@example.com).'
  }

  if (values.zipCode && !/^\d{5}$/.test(values.zipCode)) {
    errors.zipCode = 'ZIP code should be 5 digits (example: 10301).'
  }

  if (values.bio.length > MAX_BIO_LENGTH) {
    errors.bio = `Bio must be ${MAX_BIO_LENGTH} characters or fewer.`
  }

  if (values.avatarFile && values.avatarFile.size > MAX_AVATAR_BYTES) {
    errors.avatar = 'Avatar must be 1MB or smaller.'
  }

  return errors
}

export function AccountProfileForm({
  initialData,
}: {
  initialData: AccountProfileInitialData
}) {
  const [username, setUsername] = useState(initialData.username)
  const [firstName, setFirstName] = useState(initialData.firstName)
  const [lastName, setLastName] = useState(initialData.lastName)
  const [email, setEmail] = useState(initialData.email)
  const [zipCode, setZipCode] = useState(initialData.zipCode)
  const [bio, setBio] = useState(initialData.bio)
  const [displayNameFormat, setDisplayNameFormat] = useState<
    User['displayNameFormat']
  >(initialData.displayNameFormat)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentAvatarId, setCurrentAvatarId] = useState<number | null>(
    initialData.avatarId,
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    initialData.avatarUrl ? getMediaUrl(initialData.avatarUrl) : null,
  )
  const [baseline, setBaseline] = useState<ProfileFormBaseline>(() =>
    baselineFromInitial(initialData),
  )

  const isDirty = useMemo(() => {
    if (avatarFile !== null) return true
    if (username.trim() !== baseline.username.trim()) return true
    if (firstName.trim() !== baseline.firstName.trim()) return true
    if (lastName.trim() !== baseline.lastName.trim()) return true
    if (email.trim() !== baseline.email.trim()) return true
    if (zipCode.trim() !== baseline.zipCode.trim()) return true
    if (bio.trim() !== baseline.bio.trim()) return true
    if (displayNameFormat !== baseline.displayNameFormat) return true
    if (currentAvatarId !== baseline.avatarId) return true
    return false
  }, [
    avatarFile,
    username,
    firstName,
    lastName,
    email,
    zipCode,
    bio,
    displayNameFormat,
    currentAvatarId,
    baseline,
  ])

  useEffect(() => {
    if (!avatarFile) return undefined

    const objectUrl = URL.createObjectURL(avatarFile)
    setAvatarPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [avatarFile])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setAvatarFile(null)
      return
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setValidationErrors((prev) => ({
        ...prev,
        avatar: 'Avatar must be 1MB or smaller.',
      }))
      event.target.value = ''
      return
    }

    setValidationErrors((prev) => ({ ...prev, avatar: undefined }))
    setAvatarFile(file)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isDirty) return
    setError(null)
    setSuccess(null)
    setValidationErrors({})

    const trimmedUsername = username.trim()
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedEmail = email.trim()
    const trimmedZipCode = zipCode.trim()
    const trimmedBio = bio.trim()

    const formatErrors = validateForm({
      username: trimmedUsername,
      email: trimmedEmail,
      zipCode: trimmedZipCode,
      bio: trimmedBio,
      avatarFile,
    })
    const firstNameFormats: Array<User['displayNameFormat']> = [
      'firstName',
      'rank_firstName',
      'fullName',
      'rank_fullName',
    ]
    const lastNameFormats: Array<User['displayNameFormat']> = [
      'lastName',
      'rank_lastName',
      'fullName',
      'rank_fullName',
    ]

    if (firstNameFormats.includes(displayNameFormat) && !trimmedFirstName) {
      formatErrors.displayNameFormat =
        'Selected display format needs first name. Add it in private account details.'
    } else if (
      lastNameFormats.includes(displayNameFormat) &&
      !trimmedLastName
    ) {
      formatErrors.displayNameFormat =
        'Selected display format needs last name. Add it in private account details.'
    }

    if (Object.keys(formatErrors).length > 0) {
      setValidationErrors(formatErrors)
      return
    }

    setIsSaving(true)

    try {
      let uploadedAvatarId = currentAvatarId
      let uploadedAvatarUrl: string | null = null

      if (avatarFile) {
        const avatarFormData = new FormData()
        avatarFormData.append('file', avatarFile)
        avatarFormData.append('alt', `${trimmedUsername} avatar`)

        const uploadResponse = await fetch('/api/media', {
          method: 'POST',
          body: avatarFormData,
        })

        if (!uploadResponse.ok) {
          const payloadError = parsePayloadError(
            await uploadResponse.json().catch(() => null),
          )
          throw new Error(payloadError ?? 'Avatar upload failed.')
        }

        const uploadPayload = (await uploadResponse
          .json()
          .catch(() => null)) as {
          id?: number
          url?: string
          doc?: { id?: number; url?: string }
        } | null
        const mediaId = uploadPayload?.id ?? uploadPayload?.doc?.id
        const mediaUrl = uploadPayload?.url ?? uploadPayload?.doc?.url

        if (typeof mediaId !== 'number') {
          throw new Error('Avatar uploaded, but media ID was missing.')
        }

        uploadedAvatarId = mediaId
        setCurrentAvatarId(mediaId)
        if (mediaUrl) {
          uploadedAvatarUrl = getMediaUrl(mediaUrl)
        }
      }

      const response = await fetch(`/api/users/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          firstName: trimmedFirstName || null,
          lastName: trimmedLastName || null,
          email: trimmedEmail,
          zipCode: trimmedZipCode ? Number(trimmedZipCode) : null,
          bio: trimmedBio ? trimmedBio : null,
          displayNameFormat,
          avatar: uploadedAvatarId,
        }),
      })

      if (!response.ok) {
        const payloadError = parsePayloadError(
          await response.json().catch(() => null),
        )
        throw new Error(payloadError ?? 'Could not save profile updates.')
      }

      setUsername(trimmedUsername)

      await fetch('/api/profile/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [initialData.username, trimmedUsername],
        }),
      }).catch(() => {
        // Best effort cache refresh; profile save already succeeded.
      })

      if (uploadedAvatarUrl) {
        setAvatarPreviewUrl(uploadedAvatarUrl)
      }
      setAvatarFile(null)
      setBaseline({
        username: trimmedUsername,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        zipCode: trimmedZipCode,
        bio: trimmedBio,
        displayNameFormat,
        avatarId: uploadedAvatarId,
      })
      setSuccess('Account settings saved successfully.')
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while saving.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:p-8"
    >
      {isDirty && (
        <div
          className="space-y-3 border border-primary/40 bg-primary/5 p-4 md:p-5"
          role="status"
          aria-live="polite"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Unsaved changes
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your edits are not live until you save. This updates your public
            profile and private account details together.
          </p>
          <SaveProfileSubmitButton
            isSaving={isSaving}
            disabled={false}
            className="w-full rounded-none"
          />
        </div>
      )}

      <section className="grid gap-4 border border-border/50 bg-background/30 p-4 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Public Profile Information
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Visible to other Crew members when they view your profile.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
            Account Information
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Private to admins and The Second Messenger. Use this for
            personalized updates and local event relevance.
          </p>
        </div>
      </section>

      <section className="space-y-4 border border-border/50 bg-background/20 p-5">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Public Profile
          </p>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            visible to members
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-username">Username *</Label>
            <Input
              id="account-username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="spacedrifter"
              required
              className="rounded-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Required. Used in your profile URL and @handle.
            </p>
            {validationErrors.username && (
              <p className="text-xs font-semibold text-destructive">
                {validationErrors.username}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-display-name-format">
              Display Name Format *
            </Label>
            <Select
              value={displayNameFormat}
              onValueChange={(value) =>
                setDisplayNameFormat(value as User['displayNameFormat'])
              }
              disabled={isSaving}
            >
              <SelectTrigger
                id="account-display-name-format"
                className="w-full rounded-none"
              >
                <SelectValue placeholder="Select display format" />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_NAME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Required. Controls how your name appears publicly across the site.
            </p>
            {validationErrors.displayNameFormat && (
              <p className="text-xs font-semibold text-destructive">
                {validationErrors.displayNameFormat}
              </p>
            )}
          </div>
        </div>

        <section className="space-y-2">
          <Label htmlFor="account-avatar">Avatar</Label>
          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
            <div className="border border-border/50 bg-background/40 p-2">
              <div className="relative aspect-square overflow-hidden border border-border/40 bg-card/30">
                {avatarPreviewUrl ? (
                  <Image
                    src={avatarPreviewUrl}
                    alt={initialData.avatarAlt}
                    className="size-full object-cover"
                    width={160}
                    height={160}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center px-3 text-center font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                    No Avatar
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Input
                id="account-avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarChange}
                disabled={isSaving}
                className="rounded-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Max 1MB. Uploading a file replaces your current avatar
                after save.
              </p>
              {validationErrors.avatar && (
                <p className="text-xs font-semibold text-destructive">
                  {validationErrors.avatar}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="space-y-2">
          <Label htmlFor="account-bio">Bio</Label>
          <Textarea
            id="account-bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell the Crew who you are..."
            rows={6}
            className="rounded-none"
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Visible to members. Must be under {MAX_BIO_LENGTH}{' '}
            characters.
          </p>
          {validationErrors.bio && (
            <p className="text-xs font-semibold text-destructive">
              {validationErrors.bio}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4 border border-border/50 bg-background/20 p-5">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
            Account Information
          </p>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            private to admin + artist
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-email">Email *</Label>
            <Input
              id="account-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Required. Used for login, security, and direct account
              communication.
            </p>
            {validationErrors.email && (
              <p className="text-xs font-semibold text-destructive">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-zip">ZIP Code</Label>
            <Input
              id="account-zip"
              name="zipCode"
              inputMode="numeric"
              value={zipCode}
              onChange={(event) =>
                setZipCode(event.target.value.replace(/[^\d]/g, '').slice(0, 5))
              }
              placeholder="10301"
              className="rounded-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Helps promote local shows and relevant updates.
            </p>
            {validationErrors.zipCode && (
              <p className="text-xs font-semibold text-destructive">
                {validationErrors.zipCode}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-first-name">First Name</Label>
            <Input
              id="account-first-name"
              name="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Alex"
              className="rounded-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Used for personalized messages and display-name formats.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-last-name">Last Name</Label>
            <Input
              id="account-last-name"
              name="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Carter"
              className="rounded-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Helps with personal outreach and full-name display
              formats.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 border border-border/50 bg-background/20 p-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
          YouTube Connection
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {initialData.youtubeConnected && (
            <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
              <CheckCircle2 size={14} aria-hidden />
              YouTube is connected
            </div>
          )}
          <Button
            asChild
            variant="secondary"
            className="rounded-none"
            disabled={isSaving}
          >
            <Link
              href="/api/auth/youtube/connect?returnTo=/account"
              target="_blank"
              rel="noopener noreferrer"
            >
              {initialData.youtubeConnected
                ? 'Reconnect YouTube'
                : 'Connect YouTube'}
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Optional. Liking, subscribing, and commenting on YouTube already work
          with a one-time popup sign-in. Connect your account here to stay
          signed in across sessions and devices so you’re never prompted again.
        </p>
      </section>

      <section className="space-y-3 border border-border/50 bg-background/30 p-4 md:p-5">
        <h2 className="text-sm font-semibold text-foreground">
          {isDirty ? 'Save your profile' : 'Profile status'}
        </h2>
        {isDirty ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Save once to apply updates to your public Crew profile and private
            account details.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Nothing pending. Edit any field above to enable saving.
          </p>
        )}
        {error && (
          <p className="text-sm font-semibold text-destructive">{error}</p>
        )}
        {success && (
          <p className="text-sm font-semibold text-primary">{success}</p>
        )}
        {isDirty && (
          <SaveProfileSubmitButton
            isSaving={isSaving}
            disabled={false}
            className="w-full rounded-none"
          />
        )}
      </section>
    </form>
  )
}

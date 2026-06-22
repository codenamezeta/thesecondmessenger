'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus('loading')
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Payload returns 200 even when the email does not exist, to avoid
      // leaking which addresses are registered.
      if (!res.ok) {
        throw new Error('Could not send reset email. Please try again.')
      }
      setStatus('sent')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('idle')
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-20">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="font-heading tracking-widest uppercase">
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your account email and we&rsquo;ll send you a link to set a new
            password.
          </CardDescription>
        </CardHeader>
        {status === 'sent' ? (
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              If an account exists for <strong>{email}</strong>, a password reset
              link is on its way. Check your inbox (and spam folder).
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <p className="text-sm font-bold text-destructive">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  placeholder="your@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </Button>
              <Link
                href="/login"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Back to login
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

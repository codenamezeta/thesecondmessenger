'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong'
}

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('Invalid email or password')

      // Payload automatically sets the secure cookie here!
      router.push('/') // Redirect home or to a specific dashboard
      router.refresh() // Refresh the server components to show logged-in state
    } catch (err: unknown) {
      setError(errorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Create the user in Payload
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'user' }), // Automatically defaults to 'user' role based on our schema
      })

      if (!res.ok)
        throw new Error('Failed to create account. Email may be in use.')

      // 2. Automatically log them in right after creating the account
      await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(errorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-20">
      <Tabs defaultValue="login" className="w-full max-w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        {/* --- LOGIN TAB --- */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading tracking-widest uppercase">
                Welcome Back
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {error && (
                  <p className="text-sm font-bold text-destructive">{error}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    placeholder="your@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    placeholder="********"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="mt-6 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* --- REGISTER TAB --- */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading tracking-widest uppercase">
                Join the Crew
              </CardTitle>
              <CardDescription>
                Create an account to save songs and upgrade to Premium.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                {error && (
                  <p className="text-sm font-bold text-destructive">{error}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Display Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    value={name}
                    placeholder="John Doe"
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    placeholder="your@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    placeholder="********"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="mt-6 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

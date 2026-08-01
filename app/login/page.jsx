'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AuthBrandPanel from '@/components/auth-brand-panel'
import BrandLogo from '@/components/brand-logo'
import { toast } from 'sonner'
import { AlertCircle, Eye, EyeOff, Loader2, Smartphone, Mail, ArrowLeft } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  // Accounts are created with a mobile number, so that is the only sign-in
  // method shown. Email stays available behind a link for the handful of older
  // accounts that were registered with one.
  const [method, setMethod] = useState('mobile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const identifier = method === 'mobile' ? mobile : email

  const canSubmit = () =>
    password.length > 0 &&
    (method === 'mobile' ? /^[6-9]\d{9}$/.test(mobile) : email.trim().length > 3)

  const switchMethod = (next) => {
    setMethod(next)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (method === 'mobile' && !/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Signed in successfully')

      // Honour an explicit redirect (e.g. "List my land"), else land by role
      if (redirectTo && redirectTo.startsWith('/')) {
        window.location.href = redirectTo
      } else if (data.user.role === 'admin') {
        window.location.href = '/admin'
      } else if (data.user.role === 'seller' || data.user.role === 'agent') {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          <div className="mb-6 lg:hidden">
            <BrandLogo className="h-12" />
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {method === 'mobile'
              ? 'Sign in with the mobile number you registered with.'
              : 'Sign in with the email address on your account.'}
          </p>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {method === 'mobile' ? (
              <div className="space-y-2">
                <label htmlFor="mobile" className="text-sm font-medium text-foreground">Mobile number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">
                    +91
                  </span>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    maxLength={10}
                    className="h-12 rounded-xl pl-12"
                    autoComplete="tel"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                  autoComplete="email"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                <Link href="#" className="text-xs text-primary font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold"
              disabled={loading || !canSubmit()}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          {/* Mobile is the primary method; email works for accounts that added one */}
          <button
            type="button"
            onClick={() => switchMethod(method === 'mobile' ? 'email' : 'mobile')}
            className="w-full flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {method === 'mobile' ? (
              <><Mail className="w-3.5 h-3.5" /> Sign in with email instead</>
            ) : (
              <><Smartphone className="w-3.5 h-3.5" /> Sign in with mobile number instead</>
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {"Don't have an account? "}
            <Link
              href={redirectTo ? `/create-account?redirect=${encodeURIComponent(redirectTo)}` : '/create-account'}
              className="text-primary font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
            Are you an administrator?{' '}
            <Link href="/admin/login" className="text-primary font-medium hover:underline">
              Admin console
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}

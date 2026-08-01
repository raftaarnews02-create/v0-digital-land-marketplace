'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AuthBrandPanel from '@/components/auth-brand-panel'
import BrandLogo from '@/components/brand-logo'
import {
  AlertCircle, Home, Building2, User, Lock, Mail,
  Eye, EyeOff, ChevronRight, Loader2, ArrowLeft,
} from 'lucide-react'

const ROLES = [
  { value: 'buyer', label: 'Buy Land', hint: 'Browse & bid', icon: Home },
  { value: 'seller', label: 'Sell Land', hint: 'List & earn', icon: Building2 },
]

function CreateAccountContent() {
  const searchParams = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') || 'buyer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
  })

  // Prefill mobile if seller lead exists
  useEffect(() => {
    const lead = localStorage.getItem('sellerLead')
    if (lead) {
      try {
        const parsed = JSON.parse(lead)
        if (parsed.mobile) setFormData(f => ({ ...f, mobile: parsed.mobile }))
      } catch {}
    }
    const intent = localStorage.getItem('userIntent')
    if (intent === 'seller') setRole('seller')
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setError('')
    setAlreadyRegistered(false)
    setFormData(prev => ({ ...prev, [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value }))
  }

  // Email is optional — it just gives the account a second way to sign in
  const emailValid = !formData.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())

  const canSubmit = () =>
    formData.name.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(formData.mobile) &&
    formData.password.length >= 4 &&
    emailValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAlreadyRegistered(false)
    if (!canSubmit()) return

    setLoading(true)
    try {
      // The mobile number always identifies the account; the email is extra and
      // the API fills in a placeholder when it is left blank
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.mobile,
          role,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          // The email belongs to someone else — the mobile number is free, so
          // this is a plain validation error rather than a returning user
          if (data.field === 'email') {
            setError('This email is already registered. Use a different one, or leave it blank.')
            setLoading(false)
            return
          }
          // Mobile already registered — the password they typed may still be
          // the right one, so try signing them in before showing an error
          const signedIn = await signIn({ silent: true })
          if (!signedIn) {
            setAlreadyRegistered(true)
            setError('This mobile number is already registered. Sign in with your password instead.')
            setLoading(false)
          }
          return
        }
        throw new Error(data.error || 'Registration failed')
      }

      await signIn({})
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  /** Signs in with the mobile number just entered. Returns false on failure. */
  const signIn = async ({ silent }) => {
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.mobile, password: formData.password }),
      })
      const loginData = await loginRes.json()

      if (!loginRes.ok || !loginData.token) {
        if (silent) return false
        throw new Error(loginData.error || 'Login failed')
      }

      localStorage.setItem('token', loginData.token)
      localStorage.setItem('user', JSON.stringify(loginData.user))
      localStorage.removeItem('userIntent')

      const redirectTo = searchParams.get('redirect')
      const target = redirectTo && redirectTo.startsWith('/')
        ? redirectTo
        : loginData.user.role === 'seller' || loginData.user.role === 'agent' ? '/dashboard' : '/'
      window.location.href = target
      return true
    } catch (err) {
      if (silent) return false
      setError(err.message)
      setLoading(false)
      return false
    }
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center px-5 py-8 lg:px-16 lg:py-8">
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          <div className="mb-4 lg:hidden">
            <BrandLogo className="h-11" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sign up with your mobile number. Email is optional.
          </p>

          {/* Role Selection */}
          <fieldset className="mt-4">
            <legend className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              I want to
            </legend>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map((option) => {
                const selected = role === option.value
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2.5 h-12 px-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={selected}
                      onChange={() => setRole(option.value)}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'border-primary' : 'border-muted-foreground/40'
                      }`}
                      aria-hidden="true"
                    >
                      {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </span>
                    <option.icon className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold leading-tight ${selected ? 'text-primary' : 'text-foreground'}`}>
                        {option.label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground leading-tight">{option.hint}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {alreadyRegistered && (
                  <>
                    {' '}
                    <Link href="/login" className="font-semibold underline">
                      Go to sign in
                    </Link>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-xl pl-9"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="text-sm font-medium text-foreground mb-1.5 block">Mobile Number</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-muted-foreground font-medium text-sm select-none">+91</span>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-xl pl-12"
                  autoComplete="tel"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                Email
                <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 rounded-xl pl-9"
                  autoComplete="email"
                />
              </div>
              {!emailValid && (
                <p className="text-[11px] text-destructive mt-1.5">
                  Enter a valid email address, or leave it blank.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 4 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-xl pl-9 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold mt-1"
              disabled={loading || !canSubmit()}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-3.5">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] text-muted-foreground mt-2">
            By creating an account you agree to our{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> &{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <CreateAccountContent />
    </Suspense>
  )
}

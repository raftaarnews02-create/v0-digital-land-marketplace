'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertCircle, Home, Building2, User, Phone, Lock,
  Eye, EyeOff, ChevronRight, Check, Loader2
} from 'lucide-react'

const SELLER_FEATURES = [
  { icon: '📋', text: 'List your land in minutes' },
  { icon: '👁️', text: 'Reach thousands of verified buyers' },
  { icon: '💬', text: 'Manage enquiries & bids from one place' },
]

const BUYER_FEATURES = [
  { icon: '🔍', text: 'Browse verified land listings' },
  { icon: '⚡', text: 'Place bids instantly' },
  { icon: '❤️', text: 'Save & track your favourite plots' },
]

function CreateAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') || 'buyer')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
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
    setFormData(prev => ({ ...prev, [name]: name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10) : value }))
  }

  const canSubmit = () =>
    formData.name.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(formData.mobile) &&
    formData.password.length >= 4

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!canSubmit()) return

    setLoading(true)
    try {
      // Use mobile as the unique email identifier
      const email = `${formData.mobile}@user.myzameen.in`

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name.trim(),
          email,
          password: formData.password,
          phone: formData.mobile,
          role,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        // If already registered, try to log in automatically
        if (res.status === 409) {
          await autoLogin(email)
          return
        }
        throw new Error(data.error || 'Registration failed')
      }

      await autoLogin(email)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const autoLogin = async (email) => {
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: formData.password }),
      })
      const loginData = await loginRes.json()

      if (loginRes.ok && loginData.token) {
        localStorage.setItem('token', loginData.token)
        localStorage.setItem('user', JSON.stringify(loginData.user))
        // Clear intent flags
        localStorage.removeItem('userIntent')

        if (role === 'seller') {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/'
        }
      } else {
        throw new Error(loginData.error || 'Login failed')
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const features = role === 'seller' ? SELLER_FEATURES : BUYER_FEATURES

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-5 py-8">
        <div className="max-w-sm mx-auto w-full">

          {/* Logo */}
          <div className="flex items-center justify-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
              MZ
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center">Create your account</h1>
          <p className="text-sm text-muted-foreground text-center mt-1.5">
            Quick setup — takes less than a minute
          </p>

          {/* Role Selection */}
          <div className="mt-6">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2.5">I want to</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                  role === 'buyer'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${role === 'buyer' ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Home className={`w-4.5 h-4.5 ${role === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${role === 'buyer' ? 'text-primary' : 'text-foreground'}`}>Buy Land</p>
                  <p className="text-[11px] text-muted-foreground">Browse & Bid</p>
                </div>
                {role === 'buyer' && <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                  role === 'seller'
                    ? 'border-accent bg-accent/5 shadow-sm'
                    : 'border-border bg-card hover:border-accent/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${role === 'seller' ? 'bg-accent/10' : 'bg-muted'}`}>
                  <Building2 className={`w-4.5 h-4.5 ${role === 'seller' ? 'text-accent' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${role === 'seller' ? 'text-accent' : 'text-foreground'}`}>Sell Land</p>
                  <p className="text-[11px] text-muted-foreground">List & Earn</p>
                </div>
                {role === 'seller' && <Check className="w-4 h-4 text-accent ml-auto flex-shrink-0" />}
              </button>
            </div>
          </div>

          {/* Features highlight */}
          <div className="mt-4 bg-muted/60 rounded-xl p-3 space-y-1.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-base">{f.icon}</span>
                <span className="text-xs text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
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
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mobile Number</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-muted-foreground font-medium text-sm select-none">+91</span>
                <Input
                  name="mobile"
                  type="tel"
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
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password / PIN</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
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

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-3">
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

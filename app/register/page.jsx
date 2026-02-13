'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Eye, EyeOff, User, Store } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('buyer')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed')
      }

      // Auto-login after register
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })
      const loginData = await loginRes.json()

      if (loginRes.ok && loginData.token) {
        localStorage.setItem('token', loginData.token)
        localStorage.setItem('user', JSON.stringify(loginData.user))
        window.location.href = '/dashboard'
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
              LH
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center">Create Account</h1>
          <p className="text-sm text-muted-foreground text-center mt-2">Join LandHub to buy or sell land</p>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-foreground">I want to</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                    role === 'buyer' ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <User className={`w-5 h-5 ${role === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${role === 'buyer' ? 'text-primary' : 'text-foreground'}`}>Buy Land</p>
                    <p className="text-[10px] text-muted-foreground">Browse & Bid</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                    role === 'seller' ? 'border-primary bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <Store className={`w-5 h-5 ${role === 'seller' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${role === 'seller' ? 'text-primary' : 'text-foreground'}`}>Sell Land</p>
                    <p className="text-[10px] text-muted-foreground">List & Earn</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
              <Input id="name" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} required className="h-11 rounded-xl" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="h-11 rounded-xl" autoComplete="email" />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</label>
              <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} className="h-11 rounded-xl" />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  id="password" name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters" value={formData.password} onChange={handleChange}
                  required className="h-11 rounded-xl pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required className="h-11 rounded-xl" />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

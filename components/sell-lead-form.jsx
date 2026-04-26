'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Check, ArrowLeft, X, Loader2, ChevronRight } from 'lucide-react'

const STEPS = [
  { id: 0, label: 'City', icon: MapPin, title: 'Which city is your land in?', subtitle: 'Enter the city where your land is located.' },
  { id: 1, label: 'Locality', icon: MapPin, title: 'What locality or area?', subtitle: 'Enter the neighbourhood, area, or village name.' },
  { id: 2, label: 'Contact', icon: Phone, title: 'Your mobile number', subtitle: 'Buyers will contact you on this number.' },
]

export default function SellLeadForm({ onClose, onSuccess }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [city, setCity] = useState('')
  const [locality, setLocality] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [animDir, setAnimDir] = useState('right')

  const currentValue = [city, locality, mobile][step]
  const setCurrentValue = [setCity, setLocality, setMobile][step]

  const canNext = () => {
    if (step === 0) return city.trim().length >= 2
    if (step === 1) return locality.trim().length >= 2
    if (step === 2) return /^[6-9]\d{9}$/.test(mobile.trim())
    return false
  }

  const goNext = async () => {
    setError('')
    if (step < 2) {
      setAnimDir('right')
      setStep(s => s + 1)
    } else {
      await handleSubmit()
    }
  }

  const goBack = () => {
    setError('')
    setAnimDir('left')
    setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim(), locality: locality.trim(), mobile: mobile.trim(), intent: 'seller' }),
      })
      if (res.ok) {
        setDone(true)
        localStorage.setItem('sellerLead', JSON.stringify({ city, locality, mobile }))
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    onSuccess?.()
    onClose?.()
  }

  const stepInfo = STEPS[step]

  if (done) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">You're all set!</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            We've saved your details. Interested buyers in <span className="font-semibold text-foreground">{city}</span> will find you soon.
          </p>

          <div className="bg-muted rounded-xl p-4 mt-5 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">City</span>
              <span className="font-medium text-foreground capitalize">{city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Locality</span>
              <span className="font-medium text-foreground capitalize">{locality}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mobile</span>
              <span className="font-medium text-foreground">+91 {mobile}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Button className="w-full h-12 text-base font-semibold" onClick={() => router.push('/create-account?role=seller')}>
              Create Full Account <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" className="w-full" onClick={handleFinish}>
              Explore Properties First
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center gap-3">
          {step > 0 ? (
            <button onClick={goBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <div className="flex-1 text-center">
            <span className="text-xs text-muted-foreground font-medium">Step {step + 1} of 3</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 mb-5">
          <div className="flex gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s.id <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((s) => (
              <span key={s.id} className={`text-[10px] ${s.id <= step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-8">
          <div className="mb-5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <stepInfo.icon className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{stepInfo.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{stepInfo.subtitle}</p>
          </div>

          {step === 0 && (
            <Input
              key="city"
              placeholder="e.g. Jaipur, Lucknow, Indore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canNext() && goNext()}
              className="h-12 rounded-xl text-base"
              autoFocus
            />
          )}

          {step === 1 && (
            <Input
              key="locality"
              placeholder="e.g. Vaishali Nagar, Gomti Nagar"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canNext() && goNext()}
              className="h-12 rounded-xl text-base"
              autoFocus
            />
          )}

          {step === 2 && (
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm select-none">
                +91
              </span>
              <Input
                key="mobile"
                type="tel"
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && canNext() && goNext()}
                className="h-12 rounded-xl text-base pl-12"
                autoFocus
                maxLength={10}
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}

          <Button
            className="w-full h-12 mt-5 text-base font-semibold"
            onClick={goNext}
            disabled={!canNext() || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step < 2 ? (
              <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>Submit Details <Check className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

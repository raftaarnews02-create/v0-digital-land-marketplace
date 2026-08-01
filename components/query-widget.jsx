'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  MessageSquarePlus, X, Loader2, CheckCircle2, Phone, User, MapPin, Headphones,
} from 'lucide-react'

/**
 * Floating help stack: a WhatsApp shortcut and an enquiry form. Anything filled
 * in here lands in the admin Leads list, so the team can follow up on people who
 * never complete a listing or a bid.
 */

// Set in .env.local — WhatsApp is 10 digits, no +91
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ''

const INTENTS = [
  { value: 'buy', label: 'Buy land' },
  { value: 'sell', label: 'Sell land' },
  { value: 'invest', label: 'Invest' },
  { value: 'other', label: 'Something else' },
]

export default function QueryWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', mobile: '', city: '', intent: 'buy', message: '' })

  // Keep the console and the auth screens free of marketing widgets
  const hidden =
    pathname.startsWith('/admin') ||
    ['/login', '/register', '/create-account', '/messages'].includes(pathname)
  if (hidden) return null

  const update = (key) => (e) => {
    const value = key === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    setError('')
  }

  const close = () => {
    setOpen(false)
    // Reset a moment later so the panel does not flicker while closing
    setTimeout(() => { setDone(false); setError('') }, 250)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'query-widget' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send your query')

      setDone(true)
      setForm({ name: '', mobile: '', city: '', intent: 'buy', message: '' })
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/91${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        'Hi LandBid, I have a question about land listings.'
      )}`
    : null

  return (
    <>
      {/* Floating buttons — sit above the mobile bottom nav */}
      <div className="fixed right-4 bottom-20 md:bottom-6 z-40 flex flex-col items-end gap-2.5">
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 h-12 pl-3.5 pr-4 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Chat with us on WhatsApp"
          >
            {/* WhatsApp glyph */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor" aria-hidden="true">
              <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.470 0 1.45 1.06 2.86 1.21 3.06.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.02h-.01a8.2 8.2 0 01-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.37c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c0 4.54-3.69 8.22-8.24 8.22z" />
            </svg>
            <span className="text-sm font-semibold whitespace-nowrap hidden sm:inline">WhatsApp</span>
          </a>
        )}

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 h-12 pl-3.5 pr-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Raise a query"
        >
          <MessageSquarePlus className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold whitespace-nowrap hidden sm:inline">Raise a query</span>
        </button>
      </div>

      {/* Enquiry panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {done ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mt-4">Query received</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Our team will call you shortly and help you find or sell the right plot.
                </p>
                <Button className="w-full mt-6" onClick={close}>Done</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground mt-3">Tell us what you need</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Can&apos;t find the right plot, or want help listing yours? Leave your number and our
                  team will call you back.
                </p>

                {/* Intent */}
                <div className="grid grid-cols-2 gap-2 mt-5">
                  {INTENTS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, intent: option.value }))}
                      className={`h-10 rounded-xl text-sm font-medium border-2 transition-colors ${
                        form.intent === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-card text-foreground hover:border-primary/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 mt-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Your name (optional)"
                      value={form.name}
                      onChange={update('name')}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm font-medium text-muted-foreground select-none">+91</span>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Mobile number"
                      value={form.mobile}
                      onChange={update('mobile')}
                      required
                      maxLength={10}
                      className="h-11 rounded-xl pl-12"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="City or area (optional)"
                      value={form.city}
                      onChange={update('city')}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>

                  <textarea
                    value={form.message}
                    onChange={update('message')}
                    rows={3}
                    maxLength={800}
                    placeholder="Budget, size, location — anything that helps us shortlist for you"
                    className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-xs text-destructive mt-2">{error}</p>}

                <Button type="submit" className="w-full h-12 rounded-xl mt-4 font-semibold" disabled={submitting}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request a callback'}
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3">
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> WhatsApp us
                    </a>
                  )}
                  {CONTACT_EMAIL && (
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email us
                    </a>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

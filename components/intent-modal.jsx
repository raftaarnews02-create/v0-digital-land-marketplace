'use client'

import { useState, useEffect } from 'react'
import { Home, Building2, X, ArrowRight, ArrowLeft, MapPin, Phone, CheckCircle2, Loader2 } from 'lucide-react'

const T = {
  en: {
    welcome: 'Welcome to MyZameen',
    subtitle: "Tell us what you'd like to do — we'll personalise your experience.",
    buyTitle: 'Buy Land',
    buyDesc: 'Browse, bid & buy verified plots',
    sellTitle: 'Sell Land',
    sellDesc: 'List your land & reach buyers',
    skip: 'Skip for now',
    langLabel: 'हिंदी',

    step1Title: 'Where are you looking?',
    step1Sub: 'Enter the city and locality you are interested in.',
    cityPlaceholder: 'City (e.g. Jaipur)',
    localityPlaceholder: 'Locality / Area (e.g. Mansarovar)',
    next: 'Next',

    step2Title: 'Your mobile number',
    step2Sub: "We'll send you matching property alerts.",
    mobilePlaceholder: '10-digit mobile number',
    submit: 'Submit',

    successTitle: 'You\'re all set!',
    successSubBuy: 'We\'ll notify you of matching plots.',
    successSubSell: 'Our team will contact you shortly.',
    explore: 'Explore Properties',
    sellNow: 'List Your Land',

    errCity: 'Please enter a city',
    errLocality: 'Please enter a locality',
    errMobile: 'Enter a valid 10-digit mobile number',
    errServer: 'Something went wrong. Please try again.',
  },
  hi: {
    welcome: 'MyZameen में आपका स्वागत है',
    subtitle: 'हमें बताएं आप क्या करना चाहते हैं — हम आपका अनुभव व्यक्तिगत बनाएंगे।',
    buyTitle: 'जमीन खरीदें',
    buyDesc: 'सत्यापित प्लॉट ब्राउज़ करें, बोली लगाएं और खरीदें',
    sellTitle: 'जमीन बेचें',
    sellDesc: 'अपनी जमीन लिस्ट करें और खरीदारों तक पहुंचें',
    skip: 'अभी छोड़ें',
    langLabel: 'English',

    step1Title: 'आप कहाँ देख रहे हैं?',
    step1Sub: 'वह शहर और इलाका बताएं जहाँ आप जमीन चाहते हैं।',
    cityPlaceholder: 'शहर (जैसे जयपुर)',
    localityPlaceholder: 'इलाका / क्षेत्र (जैसे मानसरोवर)',
    next: 'आगे',

    step2Title: 'आपका मोबाइल नंबर',
    step2Sub: 'हम आपको मिलते-जुलते प्लॉट्स की जानकारी भेजेंगे।',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
    submit: 'जमा करें',

    successTitle: 'बढ़िया! सब तैयार है।',
    successSubBuy: 'हम आपको मिलते-जुलते प्लॉट्स की सूचना देंगे।',
    successSubSell: 'हमारी टीम जल्द आपसे संपर्क करेगी।',
    explore: 'प्रॉपर्टी देखें',
    sellNow: 'जमीन लिस्ट करें',

    errCity: 'कृपया शहर दर्ज करें',
    errLocality: 'कृपया इलाका दर्ज करें',
    errMobile: 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें',
    errServer: 'कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।',
  },
}

// Steps: 0=intent, 1=location, 2=mobile, 3=success
export default function IntentModal({ onClose }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [lang, setLang] = useState('en')
  const [step, setStep] = useState(0)
  const [intent, setIntent] = useState(null) // 'buy' | 'sell'

  const [city, setCity] = useState('')
  const [locality, setLocality] = useState('')
  const [mobile, setMobile] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const t = T[lang]

  useEffect(() => {
    const saved = localStorage.getItem('intentModalLang')
    if (saved === 'hi') setLang('hi')
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const closeModal = (action) => {
    setClosing(true)
    localStorage.setItem('intentModalDone', '1')
    setTimeout(() => onClose?.(action), 250)
  }

  const toggleLang = () => {
    const next = lang === 'en' ? 'hi' : 'en'
    setLang(next)
    localStorage.setItem('intentModalLang', next)
  }

  const handleChooseIntent = (chosen) => {
    setIntent(chosen)
    localStorage.setItem('userIntent', chosen === 'buy' ? 'buyer' : 'seller')
    setStep(1)
  }

  const handleStep1Next = () => {
    const e = {}
    if (!city.trim()) e.city = t.errCity
    if (!locality.trim()) e.locality = t.errLocality
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(2)
  }

  const handleSubmit = async () => {
    const e = {}
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) e.mobile = t.errMobile
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim(), locality: locality.trim(), mobile: mobile.trim(), intent }),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrors({ mobile: data.error || t.errServer })
        setSubmitting(false)
        return
      }
      setStep(3)
    } catch {
      setErrors({ mobile: t.errServer })
    } finally {
      setSubmitting(false)
    }
  }

  const isVisible = visible && !closing
  const totalSteps = 3 // steps 1,2,3 shown as progress; step 0 is intro

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
      }`}
    >
      <div
        className={`relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full sm:translate-y-6 opacity-0 sm:scale-95'
        }`}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Top bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors select-none"
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${lang === 'hi' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
              {lang === 'en' ? 'अ' : 'A'}
            </span>
            {t.langLabel}
          </button>
          <button
            type="button"
            onClick={() => closeModal()}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-8">

          {/* ── STEP 0: Choose intent ───────────────────────── */}
          {step === 0 && (
            <>
              <div className="mb-1 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🏡</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground leading-tight">{t.welcome}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleChooseIntent('buy')}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-background hover:border-primary hover:bg-primary/5 active:scale-[0.97] transition-all duration-150 text-left cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Home className="w-7 h-7 text-primary" />
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-foreground text-base">{t.buyTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.buyDesc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity self-end" />
                </button>

                <button
                  type="button"
                  onClick={() => handleChooseIntent('sell')}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-background hover:border-accent hover:bg-accent/5 active:scale-[0.97] transition-all duration-150 text-left cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Building2 className="w-7 h-7 text-accent" />
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-foreground text-base">{t.sellTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.sellDesc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity self-end" />
                </button>
              </div>

              <button type="button" onClick={() => closeModal()} className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                {t.skip}
              </button>
            </>
          )}

          {/* ── STEP 1: City + Locality ────────────────────── */}
          {step === 1 && (
            <>
              {/* Progress */}
              <StepProgress current={1} total={totalSteps} />

              <button type="button" onClick={() => setStep(0)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 mt-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t.step1Title}</h2>
                  <p className="text-xs text-muted-foreground">{t.step1Sub}</p>
                </div>
              </div>

              <div className="space-y-3 mt-5">
                <div>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setErrors(p => ({ ...p, city: '' })) }}
                    placeholder={t.cityPlaceholder}
                    className={`w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors ${
                      errors.city ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                    }`}
                  />
                  {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => { setLocality(e.target.value); setErrors(p => ({ ...p, locality: '' })) }}
                    placeholder={t.localityPlaceholder}
                    className={`w-full h-11 px-4 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors ${
                      errors.locality ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                    }`}
                  />
                  {errors.locality && <p className="text-xs text-destructive mt-1">{errors.locality}</p>}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStep1Next}
                className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                {t.next} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ── STEP 2: Mobile number ──────────────────────── */}
          {step === 2 && (
            <>
              <StepProgress current={2} total={totalSteps} />

              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 mt-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{t.step2Title}</h2>
                  <p className="text-xs text-muted-foreground">{t.step2Sub}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center border rounded-xl overflow-hidden bg-background focus-within:border-primary transition-colors"
                  style={{ borderColor: errors.mobile ? 'hsl(var(--destructive))' : undefined }}
                >
                  <span className="px-3 text-sm font-semibold text-muted-foreground border-r border-border h-11 flex items-center bg-muted">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, mobile: '' })) }}
                    placeholder={t.mobilePlaceholder}
                    className="flex-1 h-11 px-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
                {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{t.submit} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </>
          )}

          {/* ── STEP 3: Success ────────────────────────────── */}
          {step === 3 && (
            <div className="text-center py-4 mt-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t.successTitle}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {intent === 'buy' ? t.successSubBuy : t.successSubSell}
              </p>

              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => closeModal(intent)}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  {intent === 'buy' ? t.explore : t.sellNow}
                </button>
                <button
                  type="button"
                  onClick={() => closeModal()}
                  className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  {t.skip}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function StepProgress({ current, total }) {
  return (
    <div className="flex gap-1.5 mb-5 mt-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full flex-1 transition-all duration-300 ${
            i < current ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  )
}

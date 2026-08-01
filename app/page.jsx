'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PropertyCard from '@/components/property-card'
import IntentModal from '@/components/intent-modal'
import SellLeadForm from '@/components/sell-lead-form'
import {
  Search, MapPin, TrendingUp, Shield, FileText, Gavel, ArrowRight,
  ChevronRight, Loader2, BadgeCheck, IndianRupee, Headphones, Building2,
  Phone, MessageSquare, Sparkles,
} from 'lucide-react'

const CATEGORIES = [
  { label: 'Agricultural', value: 'agricultural', icon: '🌾', count: 1240 },
  { label: 'Residential', value: 'residential', icon: '🏠', count: 890 },
  { label: 'Commercial', value: 'commercial', icon: '🏢', count: 456 },
  { label: 'Industrial', value: 'industrial', icon: '🏭', count: 234 },
]

const STATS = [
  { value: '2,450+', label: 'Properties Listed' },
  { value: '₹50 Cr+', label: 'Value Traded' },
  { value: '15K+', label: 'Active Users' },
  { value: '98%', label: 'Verified' },
]

const HERO_PROMISES = [
  { icon: BadgeCheck, label: 'Documents verified' },
  { icon: Gavel, label: 'Open bidding' },
  { icon: IndianRupee, label: 'Zero brokerage' },
]

// Where the land sits matters as much as what it is — most of our supply is
// outside the metros
const LOCATION_TYPES = [
  { label: 'Villages', desc: 'Gaon & panchayat land', icon: '🌾', query: 'village' },
  { label: 'Tehsil & block', desc: 'Near tehsil headquarters', icon: '🏘️', query: 'tehsil' },
  { label: 'Small towns', desc: 'Tier 3 & tier 4 towns', icon: '🏡', query: 'town' },
  { label: 'City outskirts', desc: 'Ring roads & bypasses', icon: '🛣️', query: 'bypass' },
]

// The three things that make this a marketplace rather than a classifieds board
const PLATFORM_STEPS = [
  { icon: FileText, title: 'Owner lists free', desc: 'Documents are checked and the plot goes live — no listing fee.' },
  { icon: Gavel, title: 'Buyers place bids', desc: 'Everyone sees the current highest offer and can bid above it.' },
  { icon: Shield, title: 'Owner picks a buyer', desc: 'Close bidding any time and deal with the offer you like.' },
]

const TRUST_POINTS = [
  { icon: BadgeCheck, title: 'Verified everywhere', desc: 'Khasra, Jamabandi & registry checked — in a village exactly as in a city.' },
  { icon: IndianRupee, title: 'Zero brokerage', desc: 'Deal directly with owners — no commission on either side.' },
  { icon: Headphones, title: 'Support till registry', desc: 'Our team assists with paperwork right up to the sale deed.' },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState('buy')
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [trendingProperties, setTrendingProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIntentModal, setShowIntentModal] = useState(false)
  const [showSellForm, setShowSellForm] = useState(false)
  const [leadForm, setLeadForm] = useState({ intent: 'buy', city: '', locality: '', mobile: '', message: '' })
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadSuccess, setLeadSuccess] = useState(false)
  const [leadError, setLeadError] = useState('')

  // Show intent modal on first visit if not authenticated and not yet seen
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('intentModalDone')) {
      const timer = setTimeout(() => setShowIntentModal(true), 600)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties?status=active&limit=12')
        const data = await res.json()

        if (data.data && data.data.length > 0) {
          setFeaturedProperties(data.data.slice(0, 4))
          setTrendingProperties(data.data.slice(4, 8))
        } else {
          setFeaturedProperties([])
          setTrendingProperties([])
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
        setFeaturedProperties([])
        setTrendingProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (mode === 'sell') {
      // Signed-in owners go straight to the listing form; everyone else signs
      // in first and lands back on it
      if (isAuthenticated) {
        router.push('/sell')
      } else {
        router.push('/login?redirect=/sell')
      }
      return
    }
    router.push(searchQuery.trim() ? `/properties?search=${encodeURIComponent(searchQuery)}` : '/properties')
  }

  const handleIntentClose = (action) => {
    setShowIntentModal(false)
    if (action === 'sell') {
      setTimeout(() => setShowSellForm(true), 100)
    } else if (action === 'buy') {
      setTimeout(() => router.push('/properties'), 100)
    }
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(leadForm.mobile)) {
      setLeadError(t('leadError'))
      return
    }
    setLeadSubmitting(true)
    setLeadError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: leadForm.city.trim(),
          locality: leadForm.locality.trim(),
          mobile: leadForm.mobile.trim(),
          intent: leadForm.intent,
          message: leadForm.message.trim(),
          source: 'welcome-popup',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('leadError'))
      setLeadSuccess(true)
      setLeadForm({ intent: 'buy', city: '', locality: '', mobile: '', message: '' })
    } catch (err) {
      setLeadError(err.message || t('leadError'))
    } finally {
      setLeadSubmitting(false)
    }
  }

  return (
    <div className="bg-background">
      {showIntentModal && <IntentModal onClose={handleIntentClose} />}
      {showSellForm && (
        <SellLeadForm
          onClose={() => setShowSellForm(false)}
          onSuccess={() => setShowSellForm(false)}
        />
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" aria-hidden="true" />
        {/* Faint plot-grid, a nod to how land is actually divided */}
        <div
          className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
          aria-hidden="true"
        />
        <div
          className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-24 w-[26rem] h-[26rem] rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative app-shell-wide px-4 md:px-6 pt-5 pb-5 md:pt-8 md:pb-6 md:text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BadgeCheck className="w-3.5 h-3.5 text-primary" />
            {t('heroBadge')}
          </span>

          <h1 className="mt-3 text-[26px] leading-tight md:text-[42px] font-bold text-foreground text-balance md:leading-[1.1] md:max-w-3xl md:mx-auto">
            {t('heroTitle')}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 md:mt-3 leading-relaxed md:max-w-xl md:mx-auto">
            {t('heroSubtitle')}
          </p>

          {/* Search card */}
          <div className="mt-4 md:mt-5 md:max-w-3xl md:mx-auto">
            <div className="inline-flex rounded-full bg-muted p-1 mb-3">
              {[
                { value: 'buy', label: t('heroTabBuy') },
                { value: 'sell', label: t('heroTabSell') },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setMode(tab.value)}
                  className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                    mode === tab.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-2 md:gap-2 md:items-center bg-card border border-border rounded-2xl md:rounded-full p-2 shadow-sm"
            >
              <div className="relative flex-1">
                {mode === 'buy' ? (
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                ) : (
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                )}
                <Input
                  placeholder={mode === 'buy' ? t('heroSearchBuy') : t('heroSearchSell')}
                  className="pl-12 h-12 md:h-13 rounded-xl md:rounded-full bg-transparent border-0 shadow-none md:text-base focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="h-12 md:h-13 md:px-8 rounded-xl md:rounded-full font-semibold md:text-base flex-shrink-0"
              >
                {mode === 'buy' ? <>{t('heroBtnSearch')} <Search className="w-4 h-4 ml-2" /></> : <>{t('heroBtnList')} <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </form>

          </div>

          {/* What the platform promises, in three words each */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 md:justify-center">
            {HERO_PROMISES.map((promise) => (
              <span key={promise.label} className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                <promise.icon className="w-3.5 h-3.5 text-primary" /> {t(promise.label === 'Documents verified' ? 'promiseDocuments' : promise.label === 'Open bidding' ? 'promiseBidding' : 'promiseNoBrokerage')}
              </span>
            ))}
          </div>

          {/* Stats sit inside the hero so listings start higher up the page */}
          <div className="mt-4 md:mt-6 rounded-2xl border border-border bg-card/70 backdrop-blur-sm divide-x divide-border grid grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center py-2.5 md:py-3 px-1">
                <p className="text-base md:text-xl font-bold text-primary leading-none">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{stat.label === 'Properties Listed' ? t('statsListed') : stat.label === 'Value Traded' ? t('statsValue') : stat.label === 'Active Users' ? t('statsUsers') : t('statsVerified')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="px-4 md:px-6 pt-5 pb-4 md:pt-7 md:pb-5">
        <div className="app-shell-wide">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="font-semibold text-lg md:text-2xl text-foreground">{t('browseTitle')}</h2>
              <p className="hidden md:block text-sm text-muted-foreground mt-1">{t('browseSubtitle')}</p>
            </div>
            <button onClick={() => router.push('/properties')} className="text-xs md:text-sm text-primary font-medium flex items-center gap-0.5">
              {t('seeAll')} <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => router.push(`/properties?category=${cat.value}`)}
                className="flex flex-col md:flex-row items-center md:gap-3 gap-1.5 p-3 md:p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all md:text-left"
              >
                <span className="text-2xl md:text-3xl md:flex-shrink-0">{cat.icon}</span>
                <span className="md:min-w-0">
                  <span className="block text-[11px] md:text-sm font-semibold text-foreground">{cat.label}</span>
                  <span className="block text-[10px] md:text-xs text-muted-foreground md:mt-0.5">{cat.count} listings</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Properties ──────────────────────────── */}
      <section className="px-4 md:px-6 pt-2 pb-4 md:pt-3 md:pb-8">
        <div className="app-shell-wide">
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <div>
              <h2 className="font-semibold text-lg md:text-2xl text-foreground">{t('featuredTitle')}</h2>
              <p className="hidden md:block text-sm text-muted-foreground mt-1">{t('featuredSubtitle')}</p>
            </div>
            <button onClick={() => router.push('/properties')} className="text-xs md:text-sm text-primary font-medium flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : featuredProperties.length > 0 ? (
            /* Horizontal carousel on mobile, grid from md up */
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-5 md:pb-0">
              {featuredProperties.map((property) => (
                <div key={property._id} className="flex-shrink-0 w-[260px] md:w-auto">
                  <PropertyCard property={property} compact />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <p className="font-medium text-foreground">{t('featuredEmpty')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('featuredEmptyDesc')}</p>
              <Button className="mt-4" onClick={() => (isAuthenticated ? router.push('/sell') : setShowSellForm(true))}>
                {t('listProperty')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Promo banners ────────────────────────────────── */}
      <section className="px-4 md:px-6 pb-6 md:pb-12">
        <div className="app-shell-wide grid gap-3 md:gap-5 md:grid-cols-3">
          <button
            onClick={() => (isAuthenticated ? router.push('/sell') : setShowSellForm(true))}
            className="text-left rounded-2xl p-5 md:p-7 bg-gradient-to-br from-primary to-primary/75 text-primary-foreground md:col-span-2 relative overflow-hidden group"
          >
            <div className="absolute -right-10 -bottom-12 w-44 h-44 rounded-full bg-white/10" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">{t('promoOwnerTitle')}</p>
            <h3 className="text-xl md:text-3xl font-bold mt-2 leading-tight">
              {t('promoOwnerSubtitle')}
            </h3>
            <p className="text-sm md:text-base text-primary-foreground/80 mt-2 md:max-w-md">
              {t('heroSubtitle')}
            </p>
            <span className="inline-flex items-center gap-2 mt-5 bg-accent text-accent-foreground font-semibold text-sm px-5 py-2.5 rounded-full group-hover:gap-3 transition-all">
              {t('promoOwnerCta')} <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => router.push('/properties')}
            className="text-left rounded-2xl p-5 md:p-7 bg-card border border-border relative overflow-hidden hover:border-accent/40 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
              <Gavel className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mt-4 leading-tight">
              {t('promoBuyerTitle')}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {t('promoBuyerSubtitle')}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">
              {t('promoBuyerCta')} <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </section>

      {/* ── Browse by where the land is ──────────────────── */}
      <section className="px-4 md:px-6 py-6 md:py-10">
        <div className="app-shell-wide">
          <div className="mb-4 md:mb-6">
            <h2 className="font-semibold text-lg md:text-2xl text-foreground">Not just cities</h2>
            <p className="text-sm text-muted-foreground mt-1">
              We verify land wherever it is — a gaon plot gets the same document check as a city plot.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {LOCATION_TYPES.map((type) => (
              <button
                key={type.label}
                onClick={() => router.push(`/properties?search=${encodeURIComponent(type.query)}`)}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <span className="text-2xl leading-none">{type.icon}</span>
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground text-sm md:text-base">{type.label}</span>
                  <span className="block text-[11px] md:text-xs text-muted-foreground mt-0.5">{type.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* -- How it works banner ---------------------------- */}
      <section className="px-4 md:px-6 py-6 md:py-12">
        <div className="app-shell-wide">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-6 md:p-12">
            <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-white/10" aria-hidden="true" />
            <div className="absolute -left-24 -bottom-28 w-72 h-72 rounded-full bg-white/5" aria-hidden="true" />

            <div className="relative md:text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <Gavel className="w-3.5 h-3.5" /> List free, sell by bidding
              </span>
              <h2 className="text-2xl md:text-4xl font-bold mt-4 leading-tight md:max-w-2xl md:mx-auto">
                Owners list. Buyers bid. You pick the best offer.
              </h2>
              <p className="text-sm md:text-base text-primary-foreground/75 mt-3 md:max-w-xl md:mx-auto leading-relaxed">
                No fixed price, no broker deciding your rate. Every plot is verified before it goes live.
              </p>
            </div>

            <div className="relative grid gap-3 md:grid-cols-3 md:gap-5 mt-8 md:mt-10">
              {PLATFORM_STEPS.map((step, i) => (
                <div key={step.title} className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-4.5 h-4.5" />
                    </span>
                    <span className="text-xs font-bold text-primary-foreground/60">STEP {i + 1}</span>
                  </div>
                  <p className="font-semibold mt-3">{step.title}</p>
                  <p className="text-sm text-primary-foreground/70 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3 mt-8 md:justify-center">
              <Button
                onClick={() => router.push(isAuthenticated ? '/sell' : '/login?redirect=/sell')}
                className="h-12 px-7 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                List my land free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/properties')}
                className="h-12 px-7 rounded-full bg-transparent border-white/30 text-primary-foreground hover:bg-white/10 font-semibold"
              >
                Browse & bid
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending ─────────────────────────────────────── */}
      {(loading || trendingProperties.length > 0) && (
        <section className="px-4 md:px-6 py-4 md:py-8">
          <div className="app-shell-wide">
            <div className="flex items-center gap-2 mb-3 md:mb-6">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              <h2 className="font-semibold text-lg md:text-2xl text-foreground">Trending Now</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
                    <div className="h-32 bg-muted rounded-lg mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {trendingProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} compact />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Why LandBid ──────────────────────────────────── */}
      <section className="px-4 md:px-6 py-6 md:py-12">
        <div className="app-shell-wide">
          <h2 className="font-semibold text-lg md:text-2xl text-foreground mb-4 md:mb-6 md:text-center">Why buyers &amp; sellers choose LandBid</h2>
          <div className="grid gap-3 md:grid-cols-3 md:gap-5">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <point.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground mt-4">{point.title}</p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="px-4 md:px-6 py-8 md:py-14">
        <div className="app-shell-wide">
          <div className="relative overflow-hidden bg-foreground text-background rounded-3xl p-6 md:p-12 md:flex md:items-center md:justify-between md:gap-8">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/20" aria-hidden="true" />
            <div className="relative">
              <h3 className="text-xl md:text-4xl font-bold leading-tight">{t('ctaTitle')}</h3>
              <p className="text-sm md:text-lg text-background/70 mt-2 md:max-w-lg">
                {t('ctaSubtitle')}
              </p>
            </div>
            <Button
              onClick={() => router.push(isAuthenticated ? '/sell' : '/create-account?role=seller')}
              className="relative mt-5 md:mt-0 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 md:h-14 px-6 md:px-8 md:text-base rounded-full flex-shrink-0"
            >
              {t('ctaButton')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

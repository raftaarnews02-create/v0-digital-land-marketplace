'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { adminFetch, formatTimeAgo } from '@/lib/admin-api'
import {
  Search, Phone, MapPin, Home, Building2, Loader2,
  PhoneCall, X, MessageSquare, Check, TrendingUp, HelpCircle,
} from 'lucide-react'

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
]

const INTENTS = [
  { value: 'all', label: 'All intents' },
  { value: 'buy', label: 'Buyers' },
  { value: 'seller', label: 'Sellers' },
]

// Where on the site the number came from
const SOURCES = [
  { value: 'all', label: 'All sources' },
  { value: 'welcome-popup', label: 'Welcome pop-up' },
  { value: 'sell-form', label: 'Sell form' },
  { value: 'query-widget', label: 'Query widget' },
  { value: 'property-enquiry', label: 'Listing enquiry' },
]

const SOURCE_LABELS = Object.fromEntries(SOURCES.map((s) => [s.value, s.label]))

const STATUS_STYLES = {
  new: 'bg-primary/10 text-primary',
  contacted: 'bg-accent/10 text-accent',
  qualified: 'bg-blue-500/10 text-blue-600',
  converted: 'bg-emerald-500/10 text-emerald-600',
  lost: 'bg-muted text-muted-foreground',
}

const isBuyer = (intent) => intent === 'buy' || intent === 'buyer'
const isSeller = (intent) => intent === 'sell' || intent === 'seller'

/** Label + styling for every intent the site can capture. */
const intentBadge = (intent) => {
  if (isBuyer(intent)) return { label: 'Buyer', icon: Home, className: 'bg-primary/10 text-primary' }
  if (isSeller(intent)) return { label: 'Seller', icon: Building2, className: 'bg-accent/10 text-accent' }
  if (intent === 'invest') return { label: 'Investor', icon: TrendingUp, className: 'bg-emerald-500/10 text-emerald-600' }
  return { label: 'Other', icon: HelpCircle, className: 'bg-muted text-muted-foreground' }
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [intent, setIntent] = useState('all')
  const [source, setSource] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [notes, setNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      if (intent !== 'all') params.set('intent', intent)
      if (source !== 'all') params.set('source', source)
      if (search.trim()) params.set('search', search.trim())

      const res = await adminFetch(`/api/leads?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load leads')
      const data = await res.json()
      setLeads(data.data || [])
      setCounts(data.counts || {})
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [status, intent, source, search])

  // Debounce so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [load, search])

  const updateLead = async (id, patch) => {
    setSavingId(id)
    try {
      const res = await adminFetch('/api/leads', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...patch }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, ...patch } : l)))
      setSelected((prev) => (prev && prev._id === id ? { ...prev, ...patch } : prev))
      toast.success('Lead updated')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingId(null)
    }
  }

  const openLead = (lead) => {
    setSelected(lead)
    setNotes(lead.notes || '')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every phone number captured across the site — welcome pop-up, sell form and the query widget.
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STATUSES.filter((s) => s.value !== 'all').map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(status === s.value ? 'all' : s.value)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              status === s.value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <p className="text-2xl font-bold text-foreground">{counts[s.value] || 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by mobile, city or locality..."
            className="pl-9 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {INTENTS.map((i) => (
            <button
              key={i.value}
              onClick={() => setIntent(i.value)}
              className={`px-4 h-11 rounded-xl text-sm font-medium transition-colors ${
                intent === i.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-11 px-3 rounded-xl border border-input bg-card text-sm text-foreground outline-none focus:border-primary transition-colors"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No leads found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || status !== 'all' || intent !== 'all'
                ? 'Try clearing the filters.'
                : 'Leads appear here as soon as visitors submit the welcome pop-up.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Contact</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Looking in</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Source</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Intent</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Captured</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <button onClick={() => openLead(lead)} className="text-left">
                        {lead.name && (
                          <span className="block font-semibold text-foreground hover:text-primary transition-colors">
                            {lead.name}
                          </span>
                        )}
                        <span className={`block hover:text-primary transition-colors ${lead.name ? 'text-xs text-muted-foreground' : 'font-semibold text-foreground'}`}>
                          +91 {lead.mobile}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {lead.locality || lead.city ? (
                        <span className="capitalize">
                          {[lead.locality, lead.city].filter(Boolean).join(', ')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground">
                        {SOURCE_LABELS[lead.lastSource || lead.source] || 'Welcome pop-up'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {(() => {
                        const badge = intentBadge(lead.intent)
                        return (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}>
                            <badge.icon className="w-3 h-3" /> {badge.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={lead.status || 'new'}
                        onChange={(e) => updateLead(lead._id, { status: e.target.value })}
                        disabled={savingId === lead._id}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 capitalize outline-none cursor-pointer ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}
                      >
                        {STATUSES.filter((s) => s.value !== 'all').map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatTimeAgo(lead.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <a
                          href={`tel:+91${lead.mobile}`}
                          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="Call lead"
                        >
                          <Phone className="w-4 h-4 text-primary" />
                        </a>
                        <button
                          onClick={() => openLead(lead)}
                          className="px-3 h-9 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-border">
              {leads.map((lead) => (
                <li key={lead._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">+91 {lead.mobile}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {lead.locality}, {lead.city}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                      {lead.status || 'new'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <a href={`tel:+91${lead.mobile}`} className="flex-1 h-9 rounded-lg border border-border flex items-center justify-center gap-2 text-xs font-semibold">
                      <Phone className="w-3.5 h-3.5 text-primary" /> Call
                    </a>
                    <button onClick={() => openLead(lead)} className="flex-1 h-9 rounded-lg border border-border text-xs font-semibold">
                      Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Lead detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${intentBadge(selected.intent).className}`}>
              {(() => {
                const Icon = intentBadge(selected.intent).icon
                return <Icon className="w-6 h-6" />
              })()}
            </div>

            <h2 className="text-xl font-bold text-foreground mt-4">
              {selected.name || `+91 ${selected.mobile}`}
            </h2>
            {selected.name && <p className="text-sm text-muted-foreground">+91 {selected.mobile}</p>}
            {(selected.locality || selected.city) && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 capitalize">
                <MapPin className="w-3.5 h-3.5" /> {[selected.locality, selected.city].filter(Boolean).join(', ')}
              </p>
            )}

            {/* Everything this number ever asked us */}
            {selected.enquiries?.length > 0 && (
              <div className="mt-4 rounded-xl border border-border divide-y divide-border max-h-44 overflow-y-auto">
                {[...selected.enquiries].reverse().map((enquiry, i) => (
                  <div key={i} className="px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-primary">
                        {SOURCE_LABELS[enquiry.source] || enquiry.source}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatTimeAgo(enquiry.createdAt)}</span>
                    </div>
                    {enquiry.message && (
                      <p className="text-xs text-foreground mt-1 leading-relaxed">{enquiry.message}</p>
                    )}
                    {!enquiry.message && enquiry.city && (
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        Looking in {[enquiry.locality, enquiry.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-[11px] text-muted-foreground">Intent</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {intentBadge(selected.intent).label}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-[11px] text-muted-foreground">Captured</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{formatTimeAgo(selected.createdAt)}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.filter((s) => s.value !== 'all').map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateLead(selected._id, { status: s.value })}
                    disabled={savingId === selected._id}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      (selected.status || 'new') === s.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/70'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Internal notes
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Call summary, budget, follow-up date..."
                className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <a
                href={`tel:+91${selected.mobile}`}
                className="flex-1 h-11 rounded-xl border border-border flex items-center justify-center gap-2 text-sm font-semibold hover:bg-muted transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" /> Call now
              </a>
              <button
                onClick={() => updateLead(selected._id, { notes })}
                disabled={savingId === selected._id}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {savingId === selected._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

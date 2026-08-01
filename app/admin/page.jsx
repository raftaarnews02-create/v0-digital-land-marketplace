'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminFetch, formatPrice, formatTimeAgo } from '@/lib/admin-api'
import {
  PhoneCall, Package, Users, Gavel, IndianRupee, AlertTriangle,
  ArrowRight, Loader2, Home, Building2, CheckCircle2, Lock,
} from 'lucide-react'

const STATUS_STYLES = {
  new: 'bg-primary/10 text-primary',
  contacted: 'bg-accent/10 text-accent',
  qualified: 'bg-accent/10 text-accent',
  converted: 'bg-emerald-500/10 text-emerald-600',
  lost: 'bg-muted text-muted-foreground',
  active: 'bg-emerald-500/10 text-emerald-600',
  pending: 'bg-accent/10 text-accent',
  rejected: 'bg-destructive/10 text-destructive',
  closed: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch('/api/admin/stats')
        if (!res.ok) throw new Error('Failed to load dashboard data')
        setStats(await res.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-semibold text-destructive">Could not load the dashboard</p>
        <p className="text-sm text-muted-foreground mt-1">{error || 'Please try again.'}</p>
      </div>
    )
  }

  const cards = [
    {
      label: 'Total leads',
      value: stats.leads.total,
      sub: `${stats.leads.new} awaiting first contact`,
      icon: PhoneCall,
      tone: 'text-primary bg-primary/10',
      href: '/admin/leads',
    },
    {
      label: 'Properties',
      value: stats.properties.total,
      sub: `${stats.properties.active} live · ${stats.properties.pending} pending`,
      icon: Package,
      tone: 'text-accent bg-accent/10',
      href: '/admin/properties',
    },
    {
      label: 'Registered users',
      value: stats.users.total,
      sub: `${stats.users.buyers} buyers · ${stats.users.sellers} sellers`,
      icon: Users,
      tone: 'text-primary bg-primary/10',
      href: '/admin/users',
    },
    {
      label: 'Listed value',
      value: `₹${formatPrice(stats.listedValue)}`,
      sub: `${stats.bids.total} bids placed`,
      icon: IndianRupee,
      tone: 'text-emerald-600 bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything happening across the marketplace right now.
        </p>
      </div>

      {/* Buyers waiting to be let through to a seller */}
      {stats.contactRequests?.pending > 0 && (
        <Link
          href="/admin/contact-requests"
          className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 md:p-5 hover:bg-primary/10 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">
              {stats.contactRequests.pending} buyer{stats.contactRequests.pending !== 1 ? 's' : ''} waiting for contact approval
            </p>
            <p className="text-sm text-muted-foreground">Seller details stay hidden until you approve.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
        </Link>
      )}

      {/* Pending approvals callout */}
      {stats.properties.pending > 0 && (
        <Link
          href="/admin/properties?status=pending"
          className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-4 md:p-5 hover:bg-accent/10 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">
              {stats.properties.pending} listing{stats.properties.pending !== 1 ? 's' : ''} awaiting review
            </p>
            <p className="text-sm text-muted-foreground">Approve or reject them to keep sellers moving.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent flex-shrink-0" />
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const inner = (
            <>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.tone}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-4">{card.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{card.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
            </>
          )
          return card.href ? (
            <Link key={card.label} href={card.href} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all">
              {inner}
            </Link>
          ) : (
            <div key={card.label} className="rounded-2xl border border-border bg-card p-5">{inner}</div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent leads */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Latest leads</h2>
            <Link href="/admin/leads" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          {stats.recent.leads.length === 0 ? (
            <p className="px-5 py-10 text-sm text-muted-foreground text-center">
              No leads captured yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recent.leads.map((lead) => (
                <li key={lead._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    lead.intent === 'buy' || lead.intent === 'buyer' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    {lead.intent === 'buy' || lead.intent === 'buyer'
                      ? <Home className="w-4 h-4 text-primary" />
                      : <Building2 className="w-4 h-4 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">+91 {lead.mobile}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead.locality}, {lead.city}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                      {lead.status || 'new'}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">{formatTimeAgo(lead.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent properties */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Latest listings</h2>
            <Link href="/admin/properties" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          {stats.recent.properties.length === 0 ? (
            <p className="px-5 py-10 text-sm text-muted-foreground text-center">
              No properties listed yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recent.properties.map((prop) => (
                <li key={prop._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{prop.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {prop.location?.city}{prop.location?.state ? `, ${prop.location.state}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary">₹{formatPrice(prop.basePrice)}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[prop.status] || ''}`}>
                      {prop.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Funnel summary */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Listing pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Live', value: stats.properties.active, icon: CheckCircle2, tone: 'text-emerald-600' },
            { label: 'Pending review', value: stats.properties.pending, icon: AlertTriangle, tone: 'text-accent' },
            { label: 'Rejected', value: stats.properties.rejected, icon: Package, tone: 'text-destructive' },
            { label: 'Bidding closed', value: stats.properties.closed, icon: Gavel, tone: 'text-muted-foreground' },
          ].map((row) => (
            <div key={row.label} className="rounded-xl bg-muted/50 p-4">
              <row.icon className={`w-4 h-4 ${row.tone}`} />
              <p className="text-xl font-bold text-foreground mt-2">{row.value}</p>
              <p className="text-xs text-muted-foreground">{row.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

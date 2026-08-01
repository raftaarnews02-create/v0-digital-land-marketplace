'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminFetch, formatTimeAgo } from '@/lib/admin-api'
import {
  Loader2, Lock, Check, X, Phone, Mail, Package,
  ShieldCheck, MessageSquare, ExternalLink,
} from 'lucide-react'

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

const STATUS_STYLES = {
  pending: 'bg-accent/10 text-accent',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-destructive/10 text-destructive',
}

export default function AdminContactRequestsPage() {
  const [status, setStatus] = useState('pending')
  const [requests, setRequests] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [rejectFor, setRejectFor] = useState(null)
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch(`/api/contact-requests?status=${status}`)
      if (!res.ok) throw new Error('Failed to load requests')
      const data = await res.json()
      setRequests(data.data || [])
      setCounts(data.counts || {})
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  const decide = async (id, nextStatus, adminNote = '') => {
    setProcessingId(id)
    try {
      const res = await adminFetch('/api/contact-requests', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: nextStatus, adminNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      setRequests((prev) => prev.filter((r) => r._id !== id))
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, (prev.pending || 0) - 1),
        [nextStatus]: (prev[nextStatus] || 0) + 1,
      }))
      setRejectFor(null)
      setNote('')
      toast.success(nextStatus === 'approved' ? 'Contact unlocked for this buyer' : 'Request declined')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buyers cannot see seller details until you approve them here.
        </p>
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              status === tab.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && counts[tab.value] ? (
              <span className="ml-1.5 text-xs text-muted-foreground">{counts[tab.value]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card text-center py-20 px-6">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Nothing to review</p>
          <p className="text-sm text-muted-foreground mt-1">
            {status === 'pending'
              ? 'No buyers are waiting for contact approval right now.'
              : `No ${status} requests.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {requests.map((req) => (
            <div key={req._id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {(req.buyer?.name || 'B').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{req.buyer?.name || 'Buyer'}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      {req.buyer?.phone && (
                        <a href={`tel:+91${req.buyer.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                          <Phone className="w-3 h-3" /> +91 {req.buyer.phone}
                        </a>
                      )}
                      {req.buyer?.email && !req.buyer.email.includes('@user.myzameen.in') && (
                        <a href={`mailto:${req.buyer.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" /> {req.buyer.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[req.status] || ''}`}>
                  {req.status}
                </span>
              </div>

              {/* What they want access to */}
              <div className="mt-4 rounded-xl bg-muted/60 p-3">
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{req.propertyTitle}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Seller: {req.seller?.name || 'Unknown'}
                      {req.seller?.phone ? ` · +91 ${req.seller.phone}` : ''}
                    </p>
                  </div>
                  <a
                    href={`/properties/${req.propertyId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary flex-shrink-0"
                    aria-label="Open listing"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {req.message && (
                <div className="mt-3 flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{req.message}</p>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground mt-3">
                Requested {formatTimeAgo(req.createdAt)}
                {req.decidedAt ? ` · decided ${formatTimeAgo(req.decidedAt)}` : ''}
              </p>

              {req.adminNote && (
                <p className="text-[11px] text-muted-foreground mt-1 italic">Note: {req.adminNote}</p>
              )}

              {req.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => { setRejectFor(req); setNote('') }}
                    disabled={processingId === req._id}
                    className="flex-1 h-10 rounded-xl border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button
                    onClick={() => decide(req._id, 'approved')}
                    disabled={processingId === req._id}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {processingId === req._id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <ShieldCheck className="w-4 h-4" />}
                    Approve contact
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decline reason */}
      {rejectFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setRejectFor(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground">Decline this request?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {rejectFor.buyer?.name} will be told their request was not approved.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional note for the buyer"
              className="w-full mt-4 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary transition-colors resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectFor(null)}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => decide(rejectFor._id, 'rejected', note)}
                disabled={processingId === rejectFor._id}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processingId === rejectFor._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

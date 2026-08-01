'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { adminFetch, formatPrice, formatTimeAgo } from '@/lib/admin-api'
import {
  Search, Loader2, Package, CheckCircle2, XCircle, Eye, X,
  MapPin, Ruler, FileText, Gavel, ExternalLink,
} from 'lucide-react'

const TABS = [
  { value: 'pending', label: 'Pending review' },
  { value: 'active', label: 'Live' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-600',
  pending: 'bg-accent/10 text-accent',
  rejected: 'bg-destructive/10 text-destructive',
  closed: 'bg-muted text-muted-foreground',
}

function PropertiesContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState(searchParams.get('status') || 'pending')
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [rejectFor, setRejectFor] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch(`/api/properties?status=${status}&limit=100`)
      if (!res.ok) throw new Error('Failed to load properties')
      const data = await res.json()
      setProperties(data.data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  const visible = properties.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.location?.city?.toLowerCase().includes(q) ||
      p.location?.state?.toLowerCase().includes(q)
    )
  })

  const setPropertyStatus = async (id, newStatus, rejectionReason) => {
    setProcessingId(id)
    try {
      const res = await adminFetch(`/api/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, rejectionReason: rejectionReason || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }
      setProperties((prev) => prev.filter((p) => p._id !== id))
      setDetail(null)
      setRejectFor(null)
      setRejectReason('')
      toast.success(newStatus === 'active' ? 'Listing approved and live' : 'Listing rejected')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const openDetail = async (id) => {
    setDetail({ _id: id })
    setDetailLoading(true)
    try {
      const res = await adminFetch(`/api/properties/${id}`)
      if (!res.ok) throw new Error('Failed to load property')
      const data = await res.json()
      setDetail({ ...data.property, bids: data.bids || [] })
    } catch (err) {
      toast.error(err.message)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Properties</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review seller submissions and manage what is live on the marketplace.
        </p>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex gap-1 bg-muted rounded-xl p-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                status === tab.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search title or city..."
            className="pl-9 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card text-center py-20 px-6">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Nothing here</p>
          <p className="text-sm text-muted-foreground mt-1">
            No {TABS.find((t) => t.value === status)?.label.toLowerCase()} listings right now.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((prop) => (
            <div key={prop._id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
              <div className="h-36 bg-gradient-to-br from-primary/15 to-accent/15 relative">
                {prop.images?.[0] ? (
                  <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                )}
                <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[prop.status] || ''}`}>
                  {prop.status}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <p className="font-semibold text-foreground line-clamp-1">{prop.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {prop.location?.city}{prop.location?.state ? `, ${prop.location.state}` : ''}
                  </span>
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Base price</p>
                    <p className="font-bold text-primary">₹{formatPrice(prop.basePrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">Area</p>
                    <p className="text-sm font-medium text-foreground">{prop.area} {prop.areaUnit}</p>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground mt-2">Submitted {formatTimeAgo(prop.createdAt)}</p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openDetail(prop._id)}
                    className="flex-1 h-9 rounded-lg border border-border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                  {prop.status === 'pending' && (
                    <>
                      <button
                        onClick={() => { setRejectFor(prop); setRejectReason('') }}
                        disabled={processingId === prop._id}
                        className="h-9 px-3 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPropertyStatus(prop._id, 'active')}
                        disabled={processingId === prop._id}
                        className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 disabled:opacity-60 transition-colors"
                      >
                        {processingId === prop._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setDetail(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full sm:max-w-lg max-h-[88vh] overflow-y-auto bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border px-5 py-3.5 flex items-center justify-between">
              <p className="font-semibold text-foreground">Listing review</p>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-label="Close">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            ) : (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{detail.title}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[detail.location?.address, detail.location?.city, detail.location?.state].filter(Boolean).join(', ')}
                  </p>
                </div>

                {detail.images?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {detail.images.slice(0, 6).map((url, i) => (
                      <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-full aspect-square object-cover rounded-xl" />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/60 p-3 text-center">
                    <Ruler className="w-4 h-4 text-primary mx-auto" />
                    <p className="text-sm font-bold text-foreground mt-1">{detail.area}</p>
                    <p className="text-[11px] text-muted-foreground">{detail.areaUnit}</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3 text-center">
                    <FileText className="w-4 h-4 text-primary mx-auto" />
                    <p className="text-sm font-bold text-foreground mt-1">₹{formatPrice(detail.basePrice)}</p>
                    <p className="text-[11px] text-muted-foreground">Base price</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3 text-center">
                    <Gavel className="w-4 h-4 text-accent mx-auto" />
                    <p className="text-sm font-bold text-foreground mt-1">{detail.bids?.length || 0}</p>
                    <p className="text-[11px] text-muted-foreground">Bids</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{detail.description || 'No description provided.'}</p>
                </div>

                <div className="rounded-xl border border-border divide-y divide-border">
                  {[
                    { label: 'Category', value: detail.category },
                    { label: 'Khasra No.', value: detail.khasraNo || 'Not provided' },
                    { label: 'Khata No.', value: detail.khataNo || 'Not provided' },
                    { label: 'Pincode', value: detail.location?.pincode || 'Not provided' },
                    { label: 'Documents', value: `${detail.documents?.length || 0} uploaded` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span className="text-xs font-medium text-foreground capitalize">{row.value}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={`/properties/${detail._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open public page
                </a>

                {detail.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setRejectFor(detail); setRejectReason('') }}
                      className="flex-1 h-12 rounded-xl border border-destructive/30 text-destructive font-semibold text-sm hover:bg-destructive/5 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setPropertyStatus(detail._id, 'active')}
                      disabled={processingId === detail._id}
                      className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      {processingId === detail._id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <CheckCircle2 className="w-4 h-4" />}
                      Approve & publish
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject reason prompt */}
      {rejectFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClick={() => setRejectFor(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground">Reject this listing?</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rejectFor.title}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason shown to the seller (e.g. documents unclear)"
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
                onClick={() => setPropertyStatus(
                  rejectFor._id,
                  'rejected',
                  rejectReason.trim() || 'Property does not meet verification standards'
                )}
                disabled={processingId === rejectFor._id}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processingId === rejectFor._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}>
      <PropertiesContent />
    </Suspense>
  )
}

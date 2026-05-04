'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Shield, Users, Package, Gavel, TrendingUp, Search,
  CheckCircle2, XCircle, Eye, ChevronRight, Clock,
  BarChart3, FileText, AlertTriangle, ArrowLeft, Loader2,
  PhoneCall, MapPin, Home, Building2
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBids: 0,
    pendingVerifications: 0,
  })
  const [pendingProperties, setPendingProperties] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [recentBids, setRecentBids] = useState([])
  const [processingId, setProcessingId] = useState(null)
  const [detailProperty, setDetailProperty] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsSearch, setLeadsSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.role !== 'admin') {
      toast.error('Access denied. Admin only.')
      router.push('/')
    }
  }, [isAuthenticated, user, router])

  // Fetch admin data
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return

    const fetchData = async () => {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      try {
        // Fetch pending properties
        const pendingRes = await fetch('/api/properties?status=pending', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const pendingData = await pendingRes.json()
        setPendingProperties(pendingData.data || [])

        // Fetch stats (would need additional endpoints in production)
        setStats({
          totalUsers: 0,
          totalProperties: 0,
          totalBids: 0,
          pendingVerifications: pendingData.data?.length || 0,
        })

        // Fetch recent users
        const usersRes = await fetch('/api/auth/users')
        const usersData = await usersRes.json()
        setRecentUsers(usersData.users?.slice(0, 5) || [])

        // Fetch recent bids
        const bidsRes = await fetch('/api/bids', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const bidsData = await bidsRes.json()
        setRecentBids(bidsData.bids?.slice(0, 5) || [])

      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, user])

  // Fetch leads when tab is activated
  useEffect(() => {
    if (activeTab !== 'leads' || !isAuthenticated || user?.role !== 'admin') return
    if (leads.length > 0) return // already loaded
    const fetchLeads = async () => {
      setLeadsLoading(true)
      try {
        const res = await fetch('/api/leads')
        const data = await res.json()
        setLeads(data.data || [])
      } catch {
        toast.error('Failed to load leads')
      } finally {
        setLeadsLoading(false)
      }
    }
    fetchLeads()
  }, [activeTab, isAuthenticated, user])

  const formatPrice = (price) => {
    if (!price) return '0'
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
    return price.toLocaleString('en-IN')
  }

  const formatTimeAgo = (date) => {
    if (!date) return ''
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const handleApprove = async (propertyId) => {
    setProcessingId(propertyId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'active' })
      })

      if (res.ok) {
        toast.success('Property approved and now live!')
        setPendingProperties(prev => prev.filter(p => p._id !== propertyId))
        setStats(prev => ({ ...prev, pendingVerifications: prev.pendingVerifications - 1 }))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to approve property')
      }
    } catch (error) {
      console.error('Error approving property:', error)
      toast.error('Failed to approve property')
    } finally {
      setProcessingId(null)
    }
  }

  const handleViewDetail = async (propId) => {
    setDetailLoading(true)
    setDetailProperty({ _id: propId }) // placeholder to show modal
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/properties/${propId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDetailProperty({ ...data.property, bids: data.bids, totalBids: data.totalBids })
      }
    } catch {
      toast.error('Failed to load property details')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleReject = async (propertyId, reason = 'Property does not meet verification standards') => {
    setProcessingId(propertyId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
      })

      if (res.ok) {
        toast.error('Property rejected')
        setPendingProperties(prev => prev.filter(p => p._id !== propertyId))
        setStats(prev => ({ ...prev, pendingVerifications: prev.pendingVerifications - 1 }))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to reject property')
      }
    } catch (error) {
      console.error('Error rejecting property:', error)
      toast.error('Failed to reject property')
    } finally {
      setProcessingId(null)
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Admin Header */}
      <div className="sticky top-14 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h1 className="text-sm font-semibold text-foreground">Admin Panel</h1>
            </div>
            <div className="w-9" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="px-4 pt-4">
            <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
              {[
                { label: 'Users', value: stats.totalUsers || '15.4K', icon: Users, color: 'text-primary' },
                { label: 'Properties', value: stats.totalProperties || '2,450', icon: Package, color: 'text-accent' },
                { label: 'Revenue', value: '45.2L', icon: TrendingUp, color: 'text-primary' },
              ].map((stat, i) => (
                <Card key={i}>
                  <CardContent className="pt-3 pb-3 px-2 text-center">
                    <stat.icon className={`w-5 h-5 mx-auto ${stat.color}`} />
                    <p className="text-lg font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 py-3">
            <div className="max-w-lg mx-auto">
              <div className="flex bg-muted rounded-xl p-1 gap-1 overflow-x-auto no-scrollbar">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'pending', label: `Pending (${pendingProperties.length})` },
                  { key: 'leads', label: `Leads${leads.length ? ` (${leads.length})` : ''}` },
                  { key: 'users', label: 'Users' },
                  { key: 'bids', label: 'Bids' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-4 pb-24">
            <div className="max-w-lg mx-auto space-y-3">
              {/* Overview */}
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-accent" />
                          <h3 className="text-xs font-semibold text-foreground">Pending</h3>
                        </div>
                        <p className="text-2xl font-bold text-accent">{stats.pendingVerifications}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting review</p>
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs w-full" onClick={() => setActiveTab('pending')}>
                          Review <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <PhoneCall className="w-4 h-4 text-primary" />
                          <h3 className="text-xs font-semibold text-foreground">Leads</h3>
                        </div>
                        <p className="text-2xl font-bold text-primary">{leads.length || '—'}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Buyer &amp; seller enquiries</p>
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs w-full" onClick={() => setActiveTab('leads')}>
                          View All <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Platform Summary</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Total Users', value: '15,420' },
                          { label: 'Active Listings', value: '1,890' },
                          { label: 'Total Bids', value: '8,930' },
                          { label: 'Total Revenue', value: '₹45.2L' },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                            <span className="text-xs text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-semibold text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Recent Bids</h3>
                      <div className="space-y-3">
                        {recentBids.slice(0, 3).map((bid) => (
                          <div key={bid._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="text-xs font-medium text-foreground">{bid.propertyTitle || 'Property'}</p>
                              <p className="text-[10px] text-muted-foreground">{formatTimeAgo(bid.createdAt)}</p>
                            </div>
                            <span className="text-sm font-bold text-primary">{`₹${formatPrice(bid.amount)}`}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Pending Verifications */}
              {activeTab === 'pending' && (
                <>
                  {pendingProperties.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No pending verifications</p>
                        <p className="text-xs text-muted-foreground mt-1">All properties have been reviewed</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pendingProperties.map((prop) => (
                      <Card key={prop._id}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {prop.location?.city}, {prop.location?.state}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">{prop.category}</Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span>{prop.area} {prop.areaUnit}</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {prop.documents?.length || 0} docs</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(prop.createdAt)}</span>
                          </div>

                          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 h-8 text-xs" 
                              onClick={() => handleViewDetail(prop._id)}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Full Review
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 h-8 text-xs bg-primary" 
                              onClick={() => handleApprove(prop._id)}
                              disabled={processingId === prop._id}
                            >
                              {processingId === prop._id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )} Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8 text-xs px-3"
                              onClick={() => handleReject(prop._id)}
                              disabled={processingId === prop._id}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </>
              )}

              {/* Leads */}
              {activeTab === 'leads' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by city, mobile..."
                      className="pl-9 h-10 rounded-xl bg-muted border-0"
                      value={leadsSearch}
                      onChange={(e) => setLeadsSearch(e.target.value)}
                    />
                  </div>

                  {leadsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : leads.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <PhoneCall className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No leads yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Leads from the homepage modal will appear here</p>
                      </CardContent>
                    </Card>
                  ) : (
                    leads
                      .filter(l =>
                        !leadsSearch ||
                        l.city?.toLowerCase().includes(leadsSearch.toLowerCase()) ||
                        l.locality?.toLowerCase().includes(leadsSearch.toLowerCase()) ||
                        l.mobile?.includes(leadsSearch)
                      )
                      .map((lead) => (
                        <Card key={lead._id}>
                          <CardContent className="pt-3 pb-3">
                            <div className="flex items-start gap-3">
                              {/* Intent icon */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                lead.intent === 'buy' ? 'bg-primary/10' : 'bg-accent/10'
                              }`}>
                                {lead.intent === 'buy'
                                  ? <Home className="w-4 h-4 text-primary" />
                                  : <Building2 className="w-4 h-4 text-accent" />
                                }
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Mobile */}
                                <div className="flex items-center gap-2">
                                  <PhoneCall className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  <p className="text-sm font-semibold text-foreground">+91 {lead.mobile}</p>
                                  <Badge
                                    variant={lead.intent === 'buy' ? 'default' : 'secondary'}
                                    className="text-[10px] ml-auto capitalize"
                                  >
                                    {lead.intent === 'buy' ? 'Buyer' : 'Seller'}
                                  </Badge>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-1.5 mt-1">
                                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                  <p className="text-xs text-muted-foreground truncate">
                                    {lead.locality}, {lead.city}
                                  </p>
                                </div>

                                {/* Time + status */}
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" /> {formatTimeAgo(lead.createdAt)}
                                  </span>
                                  <Badge
                                    variant={lead.status === 'converted' ? 'default' : lead.status === 'contacted' ? 'secondary' : 'outline'}
                                    className="text-[10px]"
                                  >
                                    {lead.status || 'new'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Quick action: call */}
                            <div className="mt-3 pt-3 border-t border-border flex gap-2">
                              <a
                                href={`tel:+91${lead.mobile}`}
                                className="flex-1 h-8 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors"
                              >
                                <PhoneCall className="w-3 h-3" /> Call Now
                              </a>
                              <a
                                href={`https://wa.me/91${lead.mobile}?text=${encodeURIComponent(lead.intent === 'buy' ? 'Hi! We found matching land plots for you on MyZameen.' : 'Hi! We can help you list your land on MyZameen.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 h-8 rounded-lg bg-green-500/10 text-green-600 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-green-500/20 transition-colors"
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                WhatsApp
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </>
              )}

              {/* Users */}
              {activeTab === 'users' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9 h-10 rounded-xl bg-muted border-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {recentUsers.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    recentUsers.filter(u =>
                      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((usr) => (
                      <Card key={usr._id}>
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{usr.fullName?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">{usr.fullName || 'User'}</p>
                                {usr.kycVerified && <Shield className="w-3 h-3 text-primary flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{usr.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[10px]">{usr.role}</Badge>
                                <span className="text-[10px] text-muted-foreground">{formatTimeAgo(usr.createdAt)}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </>
              )}

              {/* Bids */}
              {activeTab === 'bids' && (
                <>
                  {recentBids.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 pb-6 text-center">
                        <Gavel className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No bids yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    recentBids.map((bid) => (
                      <Card key={bid._id}>
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{bid.propertyTitle || 'Property'}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">by {bid.buyerName || 'Buyer'}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> {formatTimeAgo(bid.createdAt)}
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-primary">{`₹${formatPrice(bid.amount)}`}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Property Detail Modal */}
      {detailProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setDetailProperty(null)}>
          <div
            className="bg-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{detailProperty.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {detailProperty.location?.city}, {detailProperty.location?.state}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-xs flex-shrink-0">{detailProperty.category}</Badge>
                </div>

                {/* Images */}
                {detailProperty.images?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Photos ({detailProperty.images.length})</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                      {detailProperty.images.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="h-28 w-40 rounded-xl object-cover flex-shrink-0 border border-border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Info */}
                <div className="bg-muted rounded-xl p-3 grid grid-cols-2 gap-y-2 gap-x-4">
                  {[
                    { label: 'Area', value: `${detailProperty.area} ${detailProperty.areaUnit}` },
                    { label: 'Base Price', value: `₹${formatPrice(detailProperty.basePrice)}` },
                    { label: 'Khasra No.', value: detailProperty.khasraNo || 'N/A' },
                    { label: 'Khata No.', value: detailProperty.khataNo || 'N/A' },
                    { label: 'Pincode', value: detailProperty.location?.pincode || 'N/A' },
                    { label: 'Total Bids', value: detailProperty.totalBids || 0 },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {detailProperty.description && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{detailProperty.description}</p>
                  </div>
                )}

                {/* Seller */}
                {detailProperty.seller && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Seller</p>
                    <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{detailProperty.seller?.name?.charAt(0) || 'S'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{detailProperty.seller?.name}</p>
                        {detailProperty.seller?.phone && (
                          <p className="text-xs text-muted-foreground">+91 {detailProperty.seller.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Documents ({detailProperty.documents?.length || 0})
                  </p>
                  {detailProperty.documents?.length > 0 ? (
                    <div className="space-y-2">
                      {detailProperty.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-muted rounded-xl">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{doc.name || doc.type || `Document ${i+1}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'} className="text-[10px]">
                              {doc.status || 'pending'}
                            </Badge>
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  )}
                </div>

                {/* Bids overview */}
                {detailProperty.bids?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Bids</p>
                    <div className="space-y-2">
                      {detailProperty.bids.slice(0, 5).map((bid, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-muted rounded-xl">
                          <span className="text-sm text-foreground">{bid.buyerName || 'Anonymous'}</span>
                          <span className="text-sm font-bold text-primary">₹{formatPrice(bid.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="flex gap-2.5 pt-2">
                  <Button
                    variant="destructive"
                    className="flex-1 h-11"
                    onClick={() => { handleReject(detailProperty._id); setDetailProperty(null) }}
                    disabled={processingId === detailProperty._id}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button
                    className="flex-1 h-11"
                    onClick={() => { handleApprove(detailProperty._id); setDetailProperty(null) }}
                    disabled={processingId === detailProperty._id}
                  >
                    {processingId === detailProperty._id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

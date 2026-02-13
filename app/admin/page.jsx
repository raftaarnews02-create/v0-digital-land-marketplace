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
  BarChart3, FileText, AlertTriangle, ArrowLeft
} from 'lucide-react'

const MOCK_STATS = {
  totalUsers: 15420,
  totalProperties: 2450,
  totalBids: 8930,
  revenue: 4520000,
  pendingVerifications: 23,
  activeListings: 1890,
}

const PENDING_PROPERTIES = [
  { id: 'p1', title: 'Agricultural Land near Chandigarh', seller: 'Rajesh Kumar', type: 'agricultural', area: '3.5 acres', submitted: '2 hours ago', documents: 3 },
  { id: 'p2', title: 'Commercial Plot in Noida', seller: 'Priya Sharma', type: 'commercial', area: '5000 sqft', submitted: '5 hours ago', documents: 4 },
  { id: 'p3', title: 'Residential Land Gurgaon', seller: 'Amit Verma', type: 'residential', area: '2400 sqft', submitted: '1 day ago', documents: 2 },
  { id: 'p4', title: 'Industrial Zone Ahmedabad', seller: 'Nagaraj Rao', type: 'industrial', area: '10000 sqft', submitted: '1 day ago', documents: 5 },
]

const RECENT_USERS = [
  { id: 'u1', name: 'Ananya Singh', email: 'ananya@email.com', role: 'buyer', joined: '1 hour ago', verified: true },
  { id: 'u2', name: 'Vikram Patel', email: 'vikram@email.com', role: 'seller', joined: '3 hours ago', verified: false },
  { id: 'u3', name: 'Suresh Mehta', email: 'suresh@email.com', role: 'buyer', joined: '5 hours ago', verified: true },
  { id: 'u4', name: 'Kavita Devi', email: 'kavita@email.com', role: 'seller', joined: '1 day ago', verified: false },
]

const RECENT_BIDS = [
  { id: 'b1', property: 'Fertile Agricultural Land', bidder: 'Ananya S.', amount: 550000, time: '10 min ago' },
  { id: 'b2', property: 'Commercial Business Plot', bidder: 'Tech Ventures', amount: 2200000, time: '30 min ago' },
  { id: 'b3', property: 'Apple Orchard Land', bidder: 'Vikram P.', amount: 950000, time: '1 hour ago' },
]

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const formatPrice = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
    return price.toLocaleString('en-IN')
  }

  const handleApprove = (id) => {
    toast.success('Property approved and now live')
  }

  const handleReject = (id) => {
    toast.error('Property rejected')
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

      {/* Stats Grid */}
      <div className="px-4 pt-4">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
          {[
            { label: 'Users', value: '15.4K', icon: Users, color: 'text-primary' },
            { label: 'Properties', value: '2,450', icon: Package, color: 'text-accent' },
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
              { key: 'pending', label: `Pending (${PENDING_PROPERTIES.length})` },
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
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">Pending Verifications</h3>
                  </div>
                  <p className="text-3xl font-bold text-accent">{MOCK_STATS.pendingVerifications}</p>
                  <p className="text-xs text-muted-foreground mt-1">Properties awaiting verification</p>
                  <Button size="sm" className="mt-3" onClick={() => setActiveTab('pending')}>
                    Review Now <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Platform Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Users', value: MOCK_STATS.totalUsers.toLocaleString() },
                      { label: 'Active Listings', value: MOCK_STATS.activeListings.toLocaleString() },
                      { label: 'Total Bids', value: MOCK_STATS.totalBids.toLocaleString() },
                      { label: 'Total Revenue', value: `₹${formatPrice(MOCK_STATS.revenue)}` },
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
                    {RECENT_BIDS.map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-xs font-medium text-foreground">{bid.property}</p>
                          <p className="text-[10px] text-muted-foreground">{bid.bidder} - {bid.time}</p>
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
              {PENDING_PROPERTIES.map((prop) => (
                <Card key={prop.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">by {prop.seller}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{prop.type}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>{prop.area}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {prop.documents} docs</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prop.submitted}</span>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => router.push(`/properties/${prop.id}`)}>
                        <Eye className="w-3 h-3 mr-1" /> Review
                      </Button>
                      <Button size="sm" className="flex-1 h-8 text-xs bg-primary" onClick={() => handleApprove(prop.id)}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8 text-xs px-3" onClick={() => handleReject(prop.id)}>
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              {RECENT_USERS.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((usr) => (
                <Card key={usr.id}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{usr.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{usr.name}</p>
                          {usr.verified && <Shield className="w-3 h-3 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{usr.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">{usr.role}</Badge>
                          <span className="text-[10px] text-muted-foreground">{usr.joined}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Bids */}
          {activeTab === 'bids' && (
            <>
              {RECENT_BIDS.concat([
                { id: 'b4', property: 'Premium Villa Plot', bidder: 'Meera J.', amount: 4700000, time: '2 hours ago' },
                { id: 'b5', property: 'Tea Garden Land', bidder: 'Suresh M.', amount: 2700000, time: '3 hours ago' },
                { id: 'b6', property: 'Warehouse Zone Plot', bidder: 'Amit V.', amount: 5100000, time: '5 hours ago' },
              ]).map((bid) => (
                <Card key={bid.id}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{bid.property}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">by {bid.bidder}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> {bid.time}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary">{`₹${formatPrice(bid.amount)}`}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

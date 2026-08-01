'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { adminFetch, formatTimeAgo } from '@/lib/admin-api'
import { Search, Loader2, Users, Mail, Phone, Shield } from 'lucide-react'

const ROLES = [
  { value: 'all', label: 'All' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'seller', label: 'Sellers' },
  { value: 'admin', label: 'Admins' },
]

const ROLE_STYLES = {
  buyer: 'bg-primary/10 text-primary',
  seller: 'bg-accent/10 text-accent',
  agent: 'bg-accent/10 text-accent',
  admin: 'bg-emerald-500/10 text-emerald-600',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (role !== 'all') params.set('role', role)
      if (search.trim()) params.set('search', search.trim())
      const res = await adminFetch(`/api/admin/users?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data.data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [role, search])

  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [load, search])

  // Accounts created from a mobile number get a synthetic email — don't show it
  const displayEmail = (user) =>
    user.email?.includes('@user.myzameen.in') ? null : user.email

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everyone registered on the marketplace.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or mobile..."
            className="pl-9 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                role === r.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          <>
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Name</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Contact</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Role</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">KYC</th>
                  <th className="px-5 py-3 font-semibold text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {(user.fullName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{user.fullName || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {user.phone && (
                        <a href={`tel:+91${user.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Phone className="w-3.5 h-3.5" /> +91 {user.phone}
                        </a>
                      )}
                      {displayEmail(user) && (
                        <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <Mail className="w-3.5 h-3.5" /> {user.email}
                        </a>
                      )}
                      {!user.phone && !displayEmail(user) && <span>—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_STYLES[user.role] || 'bg-muted text-muted-foreground'}`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium ${user.kycVerified ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {user.kycVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatTimeAgo(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-border">
              {users.map((user) => (
                <li key={user._id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {(user.fullName || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user.fullName || 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.phone ? `+91 ${user.phone}` : displayEmail(user) || '—'}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${ROLE_STYLES[user.role] || 'bg-muted text-muted-foreground'}`}>
                    {user.role}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

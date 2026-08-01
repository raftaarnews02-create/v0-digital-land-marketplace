'use client'

/**
 * Fetch wrapper for the admin console: attaches the bearer token and bounces
 * back to the admin login when the session is missing or no longer an admin.
 */
export async function adminFetch(url, options = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/admin/login'
    throw new Error('Admin session expired')
  }

  return res
}

export function formatPrice(price) {
  if (!price) return '0'
  if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `${(price / 100000).toFixed(1)} L`
  return Number(price).toLocaleString('en-IN')
}

export function formatTimeAgo(date) {
  if (!date) return ''
  const diffMs = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(diffMs / 3600000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(diffMs / 86400000)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN')
}

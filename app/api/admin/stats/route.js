import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { getAdmin } from '@/lib/auth'

export async function GET(request) {
  if (!getAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const db = await getDatabase()

    const [
      totalUsers, buyers, sellers,
      totalProperties, activeProperties, pendingProperties, rejectedProperties, closedProperties,
      totalBids, totalLeads, newLeads,
      pendingContactRequests, approvedContactRequests,
    ] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection('users').countDocuments({ role: 'buyer' }),
      db.collection('users').countDocuments({ role: { $in: ['seller', 'agent'] } }),
      db.collection('properties').countDocuments({}),
      db.collection('properties').countDocuments({ status: 'active' }),
      db.collection('properties').countDocuments({ status: 'pending' }),
      db.collection('properties').countDocuments({ status: 'rejected' }),
      db.collection('properties').countDocuments({ status: 'closed' }),
      db.collection('bids').countDocuments({}),
      db.collection('leads').countDocuments({}),
      db.collection('leads').countDocuments({ status: 'new' }),
      db.collection('contactRequests').countDocuments({ status: 'pending' }),
      db.collection('contactRequests').countDocuments({ status: 'approved' }),
    ])

    // Total value currently listed, plus the latest activity for the dashboard feed
    const [valueAgg, recentProperties, recentBids, recentLeads] = await Promise.all([
      db.collection('properties').aggregate([
        { $match: { status: { $in: ['active', 'closed'] } } },
        { $group: { _id: null, total: { $sum: '$basePrice' } } },
      ]).toArray(),
      db.collection('properties').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('bids').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('leads').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
    ])

    return NextResponse.json({
      users: { total: totalUsers, buyers, sellers },
      properties: {
        total: totalProperties,
        active: activeProperties,
        pending: pendingProperties,
        rejected: rejectedProperties,
        closed: closedProperties,
      },
      bids: { total: totalBids },
      leads: { total: totalLeads, new: newLeads },
      contactRequests: { pending: pendingContactRequests, approved: approvedContactRequests },
      listedValue: valueAgg[0]?.total || 0,
      recent: { properties: recentProperties, bids: recentBids, leads: recentLeads },
    })
  } catch (error) {
    console.error('[admin/stats] error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}

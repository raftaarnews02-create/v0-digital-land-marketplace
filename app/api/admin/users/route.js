import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { getAdmin } from '@/lib/auth'

export async function GET(request) {
  if (!getAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const db = await getDatabase()
    const params = request.nextUrl.searchParams
    const role = params.get('role')
    const search = params.get('search')
    const limit = parseInt(params.get('limit') || '100')

    const query = {}
    if (role && role !== 'all') query.role = role
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await db
      .collection('users')
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('[admin/users] error:', error)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

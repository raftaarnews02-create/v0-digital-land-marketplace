import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/db'
import { getAdmin } from '@/lib/auth'

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost']

// Every place on the site that can capture a phone number
export const LEAD_SOURCES = ['welcome-popup', 'sell-form', 'query-widget', 'property-enquiry', 'requirement']

export async function POST(request) {
  try {
    const body = await request.json()

    const mobile = String(body.mobile || '').replace(/\D/g, '').slice(-10)
    const city = String(body.city || '').trim()
    const locality = String(body.locality || '').trim()
    const name = String(body.name || '').trim().slice(0, 80)
    const message = String(body.message || '').trim().slice(0, 800)
    const intent = String(body.intent || 'buy').trim()
    const source = LEAD_SOURCES.includes(body.source) ? body.source : 'welcome-popup'
    const propertyId = String(body.propertyId || '').trim()

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number' }, { status: 400 })
    }

    // The welcome pop-up asks for a location; the lighter widgets do not
    if (source === 'welcome-popup' && (!city || !locality)) {
      return NextResponse.json({ error: 'City and locality are required' }, { status: 400 })
    }

    const now = new Date()
    const db = await getDatabase()

    // One record per mobile, but keep every enquiry that number ever sent so
    // the team can see the whole history before calling
    const enquiry = { source, intent, message, city, locality, propertyId, createdAt: now }

    const setFields = { mobile, intent, lastSource: source, updatedAt: now }
    if (city) setFields.city = city
    if (locality) setFields.locality = locality
    if (name) setFields.name = name

    await db.collection('leads').updateOne(
      { mobile },
      {
        $set: setFields,
        $push: { enquiries: { $each: [enquiry], $slice: -20 } },
        $setOnInsert: {
          createdAt: now,
          status: 'new',
          converted: false,
          notes: '',
          source,
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[leads] Error storing lead:', error)
    return NextResponse.json({ error: 'Failed to save your details' }, { status: 500 })
  }
}

// Admin-only: list captured leads with optional filters
export async function GET(request) {
  if (!getAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const db = await getDatabase()
    const params = request.nextUrl.searchParams
    const status = params.get('status')
    const intent = params.get('intent')
    const search = params.get('search')

    const source = params.get('source')

    const query = {}
    if (status && status !== 'all') query.status = status
    if (intent && intent !== 'all') query.intent = intent
    if (source && source !== 'all') query.lastSource = source
    if (search) {
      query.$or = [
        { mobile: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { locality: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ]
    }

    const leads = await db
      .collection('leads')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(params.get('limit') || '200'))
      .toArray()

    // Counts per status so the admin UI can show filter badges without a second call
    const counts = await db.collection('leads').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).toArray()

    return NextResponse.json({
      data: leads,
      counts: counts.reduce((acc, c) => ({ ...acc, [c._id || 'new']: c.count }), {}),
    })
  } catch (error) {
    console.error('[leads] Error listing leads:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

// Admin-only: update a lead's pipeline status or notes
export async function PATCH(request) {
  if (!getAdmin(request)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { id, status, notes } = await request.json()

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'A valid lead id is required' }, { status: 400 })
    }
    if (status && !LEAD_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const update = { updatedAt: new Date() }
    if (status) {
      update.status = status
      update.converted = status === 'converted'
    }
    if (typeof notes === 'string') update.notes = notes

    const db = await getDatabase()
    const result = await db.collection('leads').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )

    if (!result.matchedCount) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[leads] Error updating lead:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

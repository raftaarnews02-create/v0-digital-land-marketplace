import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

export async function POST(request) {
  try {
    const { city, locality, mobile, intent } = await request.json()

    if (!city || !locality || !mobile) {
      return NextResponse.json({ error: 'City, locality, and mobile are required' }, { status: 400 })
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number' }, { status: 400 })
    }

    const db = await getDatabase()

    // Upsert by mobile — update if already exists
    await db.collection('leads').updateOne(
      { mobile },
      {
        $set: {
          mobile,
          city: city.trim(),
          locality: locality.trim(),
          intent: intent || 'seller',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          status: 'new',
          converted: false,
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

export async function GET(request) {
  // Admin-only — list all leads (no auth check here for simplicity, add in production)
  try {
    const db = await getDatabase()
    const leads = await db.collection('leads').find({}).sort({ createdAt: -1 }).limit(100).toArray()
    return NextResponse.json({ data: leads })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

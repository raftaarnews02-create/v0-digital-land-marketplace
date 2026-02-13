import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const { propertyId, offerAmount, message } = await request.json()

    if (!propertyId || !offerAmount) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Save offer to MongoDB
    // const offer = await db.collection('offers').insertOne({
    //   propertyId,
    //   buyerId: decoded.id,
    //   amount: offerAmount,
    //   message,
    //   status: 'pending',
    //   createdAt: new Date(),
    // })

    return NextResponse.json(
      {
        message: 'Offer made successfully',
        offer: {
          id: 'offer_' + Date.now(),
          propertyId,
          amount: offerAmount,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Offer creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create offer' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const propertyId = request.nextUrl.searchParams.get('propertyId')

    // TODO: Fetch offers from MongoDB
    // const offers = await db.collection('offers')
    //   .find({ propertyId })
    //   .toArray()

    const offers = [
      {
        id: 'offer_1',
        propertyId,
        buyerName: 'Ananya Singh',
        amount: 520000,
        status: 'pending',
        message: 'Ready for immediate transaction',
        createdAt: '2024-02-12',
      },
      {
        id: 'offer_2',
        propertyId,
        buyerName: 'Vikram Patel',
        amount: 480000,
        status: 'rejected',
        message: 'Payment in installments',
        createdAt: '2024-02-10',
      },
    ]

    return NextResponse.json({ offers }, { status: 200 })
  } catch (error) {
    console.error('Fetch offers error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const { offerId, action } = await request.json()

    if (!offerId || !['accept', 'reject', 'counter'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      )
    }

    // TODO: Update offer status in MongoDB
    // await db.collection('offers').updateOne(
    //   { _id: new ObjectId(offerId) },
    //   { $set: { status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'counter' } }
    // )

    return NextResponse.json(
      {
        message: `Offer ${action}ed successfully`,
        status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'counter',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Offer update error:', error)
    return NextResponse.json(
      { message: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

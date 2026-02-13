import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

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

    // TODO: Fetch notifications from MongoDB
    // const notifications = await db.collection('notifications')
    //   .find({ userId: decoded.id })
    //   .sort({ createdAt: -1 })
    //   .limit(20)
    //   .toArray()

    const notifications = [
      {
        id: 'notif_1',
        type: 'bid_placed',
        title: 'New Bid on Your Property',
        message: 'Someone placed a bid of ₹550,000 on Fertile Agricultural Land',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      },
      {
        id: 'notif_2',
        type: 'bid_outbid',
        title: 'You Have Been Outbid',
        message: 'Your bid of ₹2,100,000 has been exceeded',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: 'notif_3',
        type: 'offer_received',
        title: 'New Offer Received',
        message: 'Ananya Singh made an offer of ₹900,000 for Orchard Land',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: 'notif_4',
        type: 'document_verified',
        title: 'Document Verified',
        message: 'Your Khasra Certificate has been verified',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      },
    ]

    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch notifications' },
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

    const { notificationId, action } = await request.json()

    if (!notificationId || !['mark_read', 'mark_unread', 'delete'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      )
    }

    // TODO: Update notification in MongoDB
    // if (action === 'delete') {
    //   await db.collection('notifications').deleteOne({ _id: new ObjectId(notificationId) })
    // } else {
    //   await db.collection('notifications').updateOne(
    //     { _id: new ObjectId(notificationId) },
    //     { $set: { read: action === 'mark_read' } }
    //   )
    // }

    return NextResponse.json(
      { message: `Notification ${action}` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { message: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

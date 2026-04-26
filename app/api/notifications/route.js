import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const db = await getDatabase();
    
    // Fetch notifications from MongoDB
    const notifications = await db.collection('notifications')
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ data: notifications }, { status: 200 });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { notificationId, action } = await request.json();

    if (!notificationId || !['mark_read', 'mark_unread', 'delete'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const notifId = new ObjectId(notificationId);

    if (action === 'delete') {
      await db.collection('notifications').deleteOne({ _id: notifId, userId: new ObjectId(decoded.userId) });
    } else {
      await db.collection('notifications').updateOne(
        { _id: notifId, userId: new ObjectId(decoded.userId) },
        { $set: { read: action === 'mark_read' } }
      );
    }

    return NextResponse.json(
      { message: `Notification ${action}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

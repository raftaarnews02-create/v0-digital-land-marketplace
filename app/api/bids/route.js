import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { propertyId, bidAmount } = await request.json();

    if (!propertyId || !bidAmount) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (bidAmount <= 0) {
      return NextResponse.json(
        { message: 'Bid amount must be positive' },
        { status: 400 }
      );
    }

    // TODO: Save bid to MongoDB
    // const bid = await db.collection('bids').insertOne({
    //   propertyId,
    //   userId: decoded.id,
    //   amount: bidAmount,
    //   createdAt: new Date(),
    // })

    return NextResponse.json(
      {
        message: 'Bid placed successfully',
        bid: {
          id: 'bid_' + Date.now(),
          propertyId,
          amount: bidAmount,
          status: 'active',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bid placement error:', error);
    return NextResponse.json(
      { message: 'Failed to place bid' },
      { status: 500 }
    );
  }
}

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

    // TODO: Fetch user's bids from MongoDB
    // const userBids = await db.collection('bids')
    //   .find({ userId: decoded.id })
    //   .toArray()

    const userBids = [
      {
        id: 'bid_1',
        propertyId: '1',
        amount: 550000,
        status: 'winning',
        createdAt: '2024-02-10',
      },
      {
        id: 'bid_2',
        propertyId: '3',
        amount: 2100000,
        status: 'outbid',
        createdAt: '2024-02-08',
      },
    ];

    return NextResponse.json({ bids: userBids }, { status: 200 });
  } catch (error) {
    console.error('Fetch bids error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}

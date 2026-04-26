import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PUT — buyer increases their existing bid
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newAmount } = await request.json();
    if (!newAmount || newAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const db = await getDatabase();

    let bidId;
    try { bidId = new ObjectId(id); } catch {
      return NextResponse.json({ error: 'Invalid bid ID' }, { status: 400 });
    }

    const bid = await db.collection('bids').findOne({
      _id: bidId,
      buyerId: new ObjectId(decoded.userId),
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    if (bid.status === 'accepted' || bid.status === 'rejected') {
      return NextResponse.json({ error: 'Cannot modify a finalised bid' }, { status: 400 });
    }

    const property = await db.collection('properties').findOne({ _id: bid.propertyId });
    if (!property || property.status !== 'active') {
      return NextResponse.json({ error: 'Bidding is closed for this property' }, { status: 400 });
    }

    if (parseInt(newAmount) <= bid.amount) {
      return NextResponse.json({ error: 'New amount must be higher than your current bid' }, { status: 400 });
    }

    // Check against the overall highest bid (from another buyer)
    const highestOtherBid = await db.collection('bids').findOne(
      { propertyId: bid.propertyId, _id: { $ne: bidId } },
      { sort: { amount: -1 } }
    );

    if (highestOtherBid && parseInt(newAmount) <= highestOtherBid.amount) {
      return NextResponse.json({
        error: `Your new bid must exceed the current highest bid of ₹${highestOtherBid.amount.toLocaleString('en-IN')}`,
      }, { status: 400 });
    }

    // Save previous amount in history, update bid
    await db.collection('bids').updateOne(
      { _id: bidId },
      {
        $set: { amount: parseInt(newAmount), updatedAt: new Date() },
        $push: { history: { amount: bid.amount, changedAt: new Date() } },
      }
    );

    // Notify seller
    await db.collection('notifications').insertOne({
      userId: property.sellerId,
      type: 'bid',
      title: 'Bid Increased',
      message: `A bidder increased their bid to ₹${parseInt(newAmount).toLocaleString('en-IN')} on "${property.title}"`,
      relatedId: bid.propertyId,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Bid updated successfully', newAmount: parseInt(newAmount) });
  } catch (error) {
    console.error('[bids] Increase bid error:', error);
    return NextResponse.json({ error: 'Failed to update bid' }, { status: 500 });
  }
}

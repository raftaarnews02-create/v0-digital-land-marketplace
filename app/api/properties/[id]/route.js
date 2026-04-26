import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET single property by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    // Check if requester is authenticated (to expose extra info)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = token ? verifyToken(token) : null;
    
    let propertyId;
    try {
      propertyId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    const property = await db.collection('properties').findOne({ _id: propertyId });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch seller info
    const seller = await db.collection('users').findOne(
      { _id: property.sellerId },
      { projection: { password: 0 } }
    );

    // Fetch all bids for this property sorted by amount desc
    const bids = await db.collection('bids')
      .find({ propertyId: property._id })
      .sort({ amount: -1 })
      .toArray();

    const isSeller = decoded && property.sellerId.toString() === decoded.userId;
    const isAdmin = decoded?.role === 'admin';

    // Get buyer info for each bid — expose contact details only to seller/admin
    const bidsWithBuyers = await Promise.all(
      bids.map(async (bid) => {
        const buyer = await db.collection('users').findOne(
          { _id: bid.buyerId },
          { projection: { password: 0 } }
        );
        const base = {
          ...bid,
          buyerId: bid.buyerId.toString(),
          buyerName: buyer?.fullName || 'Anonymous',
        };
        if (isSeller || isAdmin) {
          base.buyerPhone = buyer?.phone || null;
          base.buyerEmail = buyer?.email || null;
        }
        return base;
      })
    );

    // Calculate highest bid
    const highestBid = bids.length > 0 ? bids[0].amount : property.basePrice;

    return NextResponse.json({
      property: {
        ...property,
        sellerId: property.sellerId.toString(),
        seller: seller ? {
          name: seller.fullName,
          phone: seller.phone,
          verified: seller.kycVerified,
        } : null,
      },
      bids: bidsWithBuyers,
      highestBid,
      totalBids: bids.length,
    });
  } catch (error) {
    console.error('[v0] Get property error:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

// PATCH - Seller: close bidding, select winning bid, or get buyer info
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, bidId } = await request.json();
    const db = await getDatabase();

    let propertyId;
    try {
      propertyId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    const property = await db.collection('properties').findOne({ _id: propertyId });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const isSeller = property.sellerId.toString() === decoded.userId;
    const isAdmin = decoded.role === 'admin';

    if (!isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Only the seller can perform this action' }, { status: 403 });
    }

    // ── Close bidding ───────────────────────────────────────────────────────
    if (action === 'close') {
      await db.collection('properties').updateOne(
        { _id: propertyId },
        { $set: { status: 'closed', closedAt: new Date(), updatedAt: new Date() } }
      );
      return NextResponse.json({ message: 'Bidding closed successfully' });
    }

    // ── Get buyer info (non-destructive, no status change) ──────────────────
    if (action === 'buyer_info') {
      if (!bidId) return NextResponse.json({ error: 'bidId required' }, { status: 400 });
      let bidObjectId;
      try { bidObjectId = new ObjectId(bidId); } catch { return NextResponse.json({ error: 'Invalid bid ID' }, { status: 400 }); }

      const bid = await db.collection('bids').findOne({ _id: bidObjectId, propertyId });
      if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

      const buyer = await db.collection('users').findOne({ _id: bid.buyerId }, { projection: { password: 0 } });
      return NextResponse.json({
        buyer: {
          name: buyer?.fullName || 'Anonymous',
          phone: buyer?.phone || null,
          email: buyer?.email || null,
        },
        bid: { amount: bid.amount, message: bid.message, status: bid.status },
      });
    }

    // ── Select winning bid ──────────────────────────────────────────────────
    if (action === 'select_bid') {
      if (!bidId) return NextResponse.json({ error: 'bidId required' }, { status: 400 });
      let bidObjectId;
      try { bidObjectId = new ObjectId(bidId); } catch { return NextResponse.json({ error: 'Invalid bid ID' }, { status: 400 }); }

      const winningBid = await db.collection('bids').findOne({ _id: bidObjectId, propertyId });
      if (!winningBid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

      const winner = await db.collection('users').findOne({ _id: winningBid.buyerId }, { projection: { password: 0 } });

      // Mark winning bid as accepted
      await db.collection('bids').updateOne(
        { _id: bidObjectId },
        { $set: { status: 'accepted', updatedAt: new Date() } }
      );

      // Mark all other bids for this property as rejected
      await db.collection('bids').updateMany(
        { propertyId, _id: { $ne: bidObjectId } },
        { $set: { status: 'rejected', updatedAt: new Date() } }
      );

      // Close the property listing
      await db.collection('properties').updateOne(
        { _id: propertyId },
        { $set: { status: 'closed', winningBidId: bidObjectId, winningBidAmount: winningBid.amount, updatedAt: new Date() } }
      );

      // Notify winning buyer
      await db.collection('notifications').insertOne({
        userId: winningBid.buyerId,
        type: 'bid_accepted',
        title: '🎉 Your Bid Was Accepted!',
        message: `Congratulations! Your bid of ₹${winningBid.amount.toLocaleString('en-IN')} for "${property.title}" has been selected by the seller. They will contact you shortly.`,
        relatedId: propertyId,
        read: false,
        createdAt: new Date(),
      });

      // Notify all other unique bidders
      const otherBids = await db.collection('bids').find({ propertyId, _id: { $ne: bidObjectId } }).toArray();
      const uniqueBuyerIds = [...new Set(otherBids.map((b) => b.buyerId.toString()))];
      for (const buyerId of uniqueBuyerIds) {
        await db.collection('notifications').insertOne({
          userId: new ObjectId(buyerId),
          type: 'bid_rejected',
          title: 'Bidding Closed',
          message: `The seller has selected another bid for "${property.title}". Thank you for participating.`,
          relatedId: propertyId,
          read: false,
          createdAt: new Date(),
        });
      }

      return NextResponse.json({
        message: 'Winning bid selected successfully',
        buyer: {
          name: winner?.fullName || 'Anonymous',
          phone: winner?.phone || null,
          email: winner?.email || null,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[v0] PATCH property error:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// PUT - Update property (approve/reject by admin)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { status, rejectionReason } = await request.json();

    if (!['active', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    let propertyId;
    try {
      propertyId = new ObjectId(id);
    } catch {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const property = await db.collection('properties').findOne({ _id: propertyId });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || 'Property does not meet our verification standards';
    }

    await db.collection('properties').updateOne(
      { _id: propertyId },
      { $set: updateData }
    );

    // Create notification for seller
    const notificationMessage = status === 'active' 
      ? `Your property "${property.title}" has been approved and is now live on the platform!`
      : `Your property "${property.title}" has been rejected. Reason: ${rejectionReason || 'Not specified'}`;

    await db.collection('notifications').insertOne({
      userId: property.sellerId,
      type: 'system',
      title: status === 'active' ? 'Property Approved' : 'Property Rejected',
      message: notificationMessage,
      relatedId: propertyId,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: `Property ${status === 'active' ? 'approved' : 'rejected'} successfully`,
      propertyId: id,
    });
  } catch (error) {
    console.error('[v0] Update property error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}


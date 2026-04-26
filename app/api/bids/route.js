import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db';
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

    // Check if user is a buyer
    if (decoded.role !== 'buyer') {
      return NextResponse.json(
        { message: 'Only buyers can place bids. Please switch to a buyer account.' },
        { status: 403 }
      );
    }

    const { propertyId, bidAmount, message } = await request.json();

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

    const db = await getDatabase();
    
    // Get property to check ownership
    let propertyObjectId;
    try {
      propertyObjectId = new ObjectId(propertyId);
    } catch {
      return NextResponse.json(
        { message: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const property = await db.collection('properties').findOne({ _id: propertyObjectId });

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if property is active
    if (property.status !== 'active') {
      const statusMsg = property.status === 'closed'
        ? 'Bidding has been closed for this property'
        : 'This property is not available for bidding';
      return NextResponse.json({ message: statusMsg }, { status: 400 });
    }

    // Check if buyer already has a bid on this property (should use increase bid endpoint)
    const existingBid = await db.collection('bids').findOne({
      propertyId: propertyObjectId,
      buyerId: new ObjectId(decoded.userId),
    });

    if (existingBid) {
      return NextResponse.json(
        { message: 'You already have a bid on this property. Use the "Increase Bid" option to raise your bid.', existingBidId: existingBid._id },
        { status: 409 }
      );
    }

    // Check if user is the seller of this property
    if (property.sellerId.toString() === decoded.userId) {
      return NextResponse.json(
        { message: 'You cannot place a bid on your own property' },
        { status: 403 }
      );
    }

    // Check if bid is higher than current highest bid
    const highestBid = await db.collection('bids')
      .findOne({ propertyId: propertyObjectId }, { sort: { amount: -1 } });

    if (highestBid && bidAmount <= highestBid.amount) {
      return NextResponse.json(
        { message: `Bid must be higher than current highest bid of ₹${highestBid.amount.toLocaleString('en-IN')}` },
        { status: 400 }
      );
    }

    // Save bid to MongoDB
    const newBid = {
      propertyId: propertyObjectId,
      buyerId: new ObjectId(decoded.userId),
      amount: parseInt(bidAmount),
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('bids').insertOne(newBid);

    // Create notification for the seller
    await db.collection('notifications').insertOne({
      userId: property.sellerId,
      type: 'bid',
      title: 'New Bid Received',
      message: `A new bid of ₹${parseInt(bidAmount).toLocaleString('en-IN')} has been placed on your property "${property.title}"`,
      relatedId: result.insertedId,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Bid placed successfully',
        bid: {
          _id: result.insertedId,
          propertyId,
          amount: bidAmount,
          status: 'pending',
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

    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');

    let query = {};

    // If propertyId is provided, fetch bids for that property (for seller)
    if (propertyId) {
      let propertyObjectId;
      try {
        propertyObjectId = new ObjectId(propertyId);
      } catch {
        return NextResponse.json({ message: 'Invalid property ID' }, { status: 400 });
      }
      
      const property = await db.collection('properties').findOne({ _id: propertyObjectId });
      if (!property) {
        return NextResponse.json({ message: 'Property not found' }, { status: 404 });
      }
      
      // Only the seller can see all bids for their property
      if (property.sellerId.toString() !== decoded.userId && decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }
      
      query.propertyId = propertyObjectId;
    } else {
      // Otherwise fetch user's bids
      query.buyerId = new ObjectId(decoded.userId);
    }

    const userBids = await db.collection('bids')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Get property details for each bid
    const bidsWithProperties = await Promise.all(
      userBids.map(async (bid) => {
        const property = await db.collection('properties').findOne(
          { _id: bid.propertyId },
          { projection: { title: 1, location: 1, basePrice: 1 } }
        );
        return {
          ...bid,
          propertyTitle: property?.title || 'Unknown Property',
          propertyLocation: property?.location ? `${property.location.city}, ${property.location.state}` : '',
        };
      })
    );

    return NextResponse.json({ bids: bidsWithProperties }, { status: 200 });
  } catch (error) {
    console.error('Fetch bids error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}

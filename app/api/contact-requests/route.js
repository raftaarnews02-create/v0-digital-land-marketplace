import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db';
import { getAuth, getAdmin } from '@/lib/auth';

/**
 * Buyers ask an admin for permission to contact a seller. Nothing is revealed
 * until that request is approved.
 */

// POST — a buyer raises a request for one listing
export async function POST(request) {
  const decoded = getAuth(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Please sign in to request contact' }, { status: 401 });
  }

  try {
    const { propertyId, message } = await request.json();

    if (!propertyId || !ObjectId.isValid(propertyId)) {
      return NextResponse.json({ error: 'A valid property is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const propertyObjectId = new ObjectId(propertyId);
    const property = await db.collection('properties').findOne({ _id: propertyObjectId });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.sellerId.toString() === decoded.userId) {
      return NextResponse.json({ error: 'This is your own listing' }, { status: 400 });
    }

    const buyerId = new ObjectId(decoded.userId);
    const existing = await db.collection('contactRequests').findOne({
      propertyId: propertyObjectId,
      buyerId,
    });

    if (existing?.status === 'approved') {
      return NextResponse.json({ status: 'approved', message: 'Contact already unlocked' });
    }
    if (existing?.status === 'pending') {
      return NextResponse.json({ status: 'pending', message: 'Your request is already with our team' });
    }

    const now = new Date();
    await db.collection('contactRequests').updateOne(
      { propertyId: propertyObjectId, buyerId },
      {
        $set: {
          propertyId: propertyObjectId,
          buyerId,
          sellerId: property.sellerId,
          propertyTitle: property.title,
          message: String(message || '').trim().slice(0, 500),
          status: 'pending',
          updatedAt: now,
          decidedAt: null,
          decidedBy: null,
          adminNote: '',
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    return NextResponse.json({ status: 'pending', message: 'Request sent for approval' }, { status: 201 });
  } catch (error) {
    console.error('[contact-requests] create error:', error);
    return NextResponse.json({ error: 'Could not send your request' }, { status: 500 });
  }
}

// GET — admins see everything; buyers see only their own
export async function GET(request) {
  const decoded = getAuth(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const params = request.nextUrl.searchParams;
    const isAdmin = decoded.role === 'admin';

    const query = {};
    if (!isAdmin) {
      query.buyerId = new ObjectId(decoded.userId);
    } else {
      const status = params.get('status');
      if (status && status !== 'all') query.status = status;
    }

    const requests = await db
      .collection('contactRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(params.get('limit') || '200'))
      .toArray();

    if (!isAdmin) {
      return NextResponse.json({ data: requests });
    }

    // Admins need to see who is asking about what
    const userIds = [...new Set(requests.flatMap((r) => [r.buyerId?.toString(), r.sellerId?.toString()]).filter(Boolean))];
    const users = await db
      .collection('users')
      .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } }, { projection: { password: 0 } })
      .toArray();
    const byId = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const counts = await db.collection('contactRequests').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).toArray();

    return NextResponse.json({
      data: requests.map((r) => {
        const buyer = byId[r.buyerId?.toString()];
        const seller = byId[r.sellerId?.toString()];
        return {
          ...r,
          buyer: buyer ? { name: buyer.fullName, phone: buyer.phone, email: buyer.email, role: buyer.role } : null,
          seller: seller ? { name: seller.fullName, phone: seller.phone, email: seller.email } : null,
        };
      }),
      counts: counts.reduce((acc, c) => ({ ...acc, [c._id || 'pending']: c.count }), {}),
    });
  } catch (error) {
    console.error('[contact-requests] list error:', error);
    return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 });
  }
}

// PATCH — admin approves or rejects
export async function PATCH(request) {
  const admin = getAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { id, status, adminNote } = await request.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'A valid request id is required' }, { status: 400 });
    }
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 });
    }

    const db = await getDatabase();
    const contactRequest = await db.collection('contactRequests').findOne({ _id: new ObjectId(id) });

    if (!contactRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await db.collection('contactRequests').updateOne(
      { _id: contactRequest._id },
      {
        $set: {
          status,
          adminNote: String(adminNote || '').trim().slice(0, 500),
          decidedAt: new Date(),
          decidedBy: new ObjectId(admin.userId),
          updatedAt: new Date(),
        },
      }
    );

    // Tell the buyer either way
    await db.collection('notifications').insertOne({
      userId: contactRequest.buyerId,
      type: status === 'approved' ? 'contact_approved' : 'contact_rejected',
      title: status === 'approved' ? 'Contact unlocked' : 'Contact request declined',
      message: status === 'approved'
        ? `You can now contact the seller of "${contactRequest.propertyTitle}" and chat on LandBid.`
        : `Your request to contact the seller of "${contactRequest.propertyTitle}" was not approved.`,
      relatedId: contactRequest.propertyId,
      read: false,
      createdAt: new Date(),
    });

    if (status === 'approved') {
      await db.collection('notifications').insertOne({
        userId: contactRequest.sellerId,
        type: 'contact_approved',
        title: 'A buyer can now reach you',
        message: `An interested buyer has been approved to contact you about "${contactRequest.propertyTitle}".`,
        relatedId: contactRequest.propertyId,
        read: false,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact-requests] update error:', error);
    return NextResponse.json({ error: 'Failed to update the request' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db';
import { getAuth } from '@/lib/auth';
import { getContactAccess } from '@/lib/contact-access';

/**
 * Chat between a buyer and a seller about one listing. A conversation can only
 * be opened once the buyer's contact request has been approved (or their bid
 * was selected) — the same gate that reveals phone numbers.
 */

async function findOrCreateConversation(db, { property, buyerId, sellerId }) {
  const existing = await db.collection('conversations').findOne({
    propertyId: property._id,
    buyerId,
    sellerId,
  });
  if (existing) return existing;

  const now = new Date();
  const doc = {
    propertyId: property._id,
    propertyTitle: property.title,
    buyerId,
    sellerId,
    participants: [buyerId, sellerId],
    lastMessage: '',
    lastMessageAt: now,
    unread: {},
    createdAt: now,
  };
  const result = await db.collection('conversations').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// GET — conversation list, or the messages inside one conversation
export async function GET(request) {
  const decoded = getAuth(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = await getDatabase();
    const params = request.nextUrl.searchParams;
    const viewerId = new ObjectId(decoded.userId);
    const conversationId = params.get('conversationId');

    // ── Messages inside one conversation ──────────────────────────────────
    if (conversationId) {
      if (!ObjectId.isValid(conversationId)) {
        return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 });
      }
      const conversation = await db.collection('conversations').findOne({
        _id: new ObjectId(conversationId),
        participants: viewerId,
      });
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const messages = await db
        .collection('messages')
        .find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .limit(500)
        .toArray();

      // Everything the viewer just opened counts as read
      await db.collection('conversations').updateOne(
        { _id: conversation._id },
        { $set: { [`unread.${decoded.userId}`]: 0 } }
      );

      const otherId = conversation.buyerId.toString() === decoded.userId
        ? conversation.sellerId
        : conversation.buyerId;
      const other = await db.collection('users').findOne(
        { _id: otherId },
        { projection: { password: 0 } }
      );

      return NextResponse.json({
        conversation: {
          _id: conversation._id,
          propertyId: conversation.propertyId,
          propertyTitle: conversation.propertyTitle,
          withUser: {
            _id: otherId.toString(),
            name: other?.fullName || 'User',
            phone: other?.phone || null,
          },
        },
        messages: messages.map((m) => ({
          _id: m._id,
          text: m.text,
          createdAt: m.createdAt,
          mine: m.senderId.toString() === decoded.userId,
        })),
      });
    }

    // ── Conversation list ─────────────────────────────────────────────────
    const conversations = await db
      .collection('conversations')
      .find({ participants: viewerId })
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .toArray();

    const otherIds = conversations.map((c) =>
      c.buyerId.toString() === decoded.userId ? c.sellerId : c.buyerId
    );
    const others = otherIds.length
      ? await db.collection('users')
          .find({ _id: { $in: otherIds } }, { projection: { password: 0 } })
          .toArray()
      : [];
    const byId = Object.fromEntries(others.map((u) => [u._id.toString(), u]));

    return NextResponse.json({
      data: conversations.map((c) => {
        const otherId = (c.buyerId.toString() === decoded.userId ? c.sellerId : c.buyerId).toString();
        const other = byId[otherId];
        return {
          _id: c._id,
          propertyId: c.propertyId,
          propertyTitle: c.propertyTitle,
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          unread: c.unread?.[decoded.userId] || 0,
          withUser: {
            _id: otherId,
            name: other?.fullName || 'User',
            phone: other?.phone || null,
          },
        };
      }),
    });
  } catch (error) {
    console.error('[messages] list error:', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

// POST — open a conversation for a listing, and/or send a message
export async function POST(request) {
  const decoded = getAuth(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { propertyId, conversationId, message } = await request.json();
    const db = await getDatabase();
    const viewerId = new ObjectId(decoded.userId);

    let conversation;

    if (conversationId) {
      if (!ObjectId.isValid(conversationId)) {
        return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 });
      }
      conversation = await db.collection('conversations').findOne({
        _id: new ObjectId(conversationId),
        participants: viewerId,
      });
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Opening a chat from a listing — this is where the gate applies
      if (!propertyId || !ObjectId.isValid(propertyId)) {
        return NextResponse.json({ error: 'A valid property is required' }, { status: 400 });
      }

      const propertyObjectId = new ObjectId(propertyId);
      const property = await db.collection('properties').findOne({ _id: propertyObjectId });
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      if (property.sellerId.toString() === decoded.userId) {
        return NextResponse.json(
          { error: 'Open the chat from your buyer list instead' },
          { status: 400 }
        );
      }

      const access = await getContactAccess(db, {
        propertyId: propertyObjectId,
        viewerId: decoded.userId,
        isSeller: false,
        isAdmin: decoded.role === 'admin',
      });

      if (!access.unlocked) {
        return NextResponse.json(
          {
            error: 'Chat unlocks once our team approves your contact request',
            requestStatus: access.request?.status || null,
          },
          { status: 403 }
        );
      }

      conversation = await findOrCreateConversation(db, {
        property,
        buyerId: viewerId,
        sellerId: property.sellerId,
      });
    }

    // Opening the chat without text is fine — the UI does this on "Message"
    const text = String(message || '').trim();
    if (!text) {
      return NextResponse.json({ conversationId: conversation._id, sent: false });
    }

    const now = new Date();
    const recipientId = conversation.participants.find((p) => p.toString() !== decoded.userId);

    await db.collection('messages').insertOne({
      conversationId: conversation._id,
      propertyId: conversation.propertyId,
      senderId: viewerId,
      recipientId,
      text: text.slice(0, 2000),
      createdAt: now,
    });

    await db.collection('conversations').updateOne(
      { _id: conversation._id },
      {
        $set: { lastMessage: text.slice(0, 140), lastMessageAt: now },
        $inc: { [`unread.${recipientId.toString()}`]: 1 },
      }
    );

    return NextResponse.json({ conversationId: conversation._id, sent: true }, { status: 201 });
  } catch (error) {
    console.error('[messages] send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

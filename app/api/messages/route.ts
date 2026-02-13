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

    const { recipientId, propertyId, message } = await request.json()

    if (!recipientId || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { message: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    // TODO: Save message to MongoDB
    // const newMessage = await db.collection('messages').insertOne({
    //   senderId: decoded.id,
    //   recipientId,
    //   propertyId,
    //   message,
    //   read: false,
    //   createdAt: new Date(),
    // })

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        data: {
          id: 'msg_' + Date.now(),
          senderId: decoded.id,
          recipientId,
          message,
          read: false,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { message: 'Failed to send message' },
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

    const conversationId = request.nextUrl.searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { message: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch messages from MongoDB
    // const messages = await db.collection('messages')
    //   .find({
    //     $or: [
    //       { conversationId, $or: [{ senderId: decoded.id }, { recipientId: decoded.id }] }
    //     ]
    //   })
    //   .sort({ createdAt: 1 })
    //   .toArray()

    const messages = [
      {
        id: 'msg_1',
        senderId: 'user_1',
        senderName: 'Ananya Singh',
        message: 'Hi, I am interested in your agricultural land. Is it still available?',
        read: true,
        createdAt: '2024-02-12T10:30:00',
      },
      {
        id: 'msg_2',
        senderId: 'seller',
        senderName: 'Rajesh Kumar',
        message: 'Yes, it is available. We have received one bid already. Would you like to place a bid?',
        read: true,
        createdAt: '2024-02-12T10:45:00',
      },
      {
        id: 'msg_3',
        senderId: 'user_1',
        senderName: 'Ananya Singh',
        message: 'What is the minimum asking price?',
        read: true,
        createdAt: '2024-02-12T11:00:00',
      },
      {
        id: 'msg_4',
        senderId: 'seller',
        senderName: 'Rajesh Kumar',
        message: 'The starting bid is ₹400,000. Current highest bid is ₹500,000.',
        read: false,
        createdAt: '2024-02-12T11:15:00',
      },
    ]

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Fetch messages error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

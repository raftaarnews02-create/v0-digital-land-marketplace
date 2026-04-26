import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET all properties with search and filters
export async function GET(request) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    
    // Check if fetching seller's properties
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    
    let query = {};
    
    // If sellerId provided, fetch only that seller's properties (including pending/rejected)
    if (sellerId) {
      query.sellerId = new ObjectId(sellerId);
      // Don't filter by status when fetching seller's own properties
    } else {
      // Public listings only show active properties
      query.status = status || 'active';
    }
    
    if (searchParams.has('search') && !sellerId) {
      const search = searchParams.get('search');
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (searchParams.has('category') && !sellerId) {
      query.category = searchParams.get('category');
    }

    if (searchParams.has('minPrice') && !sellerId) {
      query.basePrice = { $gte: parseInt(searchParams.get('minPrice') || '0') };
    }

    if (searchParams.has('maxPrice') && !sellerId) {
      if (query.basePrice) {
        query.basePrice.$lte = parseInt(searchParams.get('maxPrice') || '999999999');
      } else {
        query.basePrice = { $lte: parseInt(searchParams.get('maxPrice') || '999999999') };
      }
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const properties = await db
      .collection('properties')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('properties').countDocuments(query);

    return NextResponse.json({
      data: properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[v0] Get properties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST create new property
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, location, area, areaUnit, basePrice, category, images } = body;

    if (!title || !description || !location || !area || !basePrice || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const newProperty = {
      sellerId: new ObjectId(decoded.userId),
      title,
      description,
      location,
      area,
      areaUnit: areaUnit || 'sqm',
      basePrice,
      images: images || [],
      documents: [],
      status: 'pending', // Set to pending for admin verification
      category,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('properties').insertOne(newProperty);

    // Create notification for the seller
    await db.collection('notifications').insertOne({
      userId: new ObjectId(decoded.userId),
      type: 'system',
      title: 'Property Submitted',
      message: `Your property "${title}" has been submitted for verification. It will be reviewed by our admin team.`,
      relatedId: result.insertedId,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId, ...newProperty, message: 'Property submitted for verification' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Create property error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

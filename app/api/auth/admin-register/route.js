import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';

// This endpoint is for creating admin users
// In production, this should be protected or removed after initial setup
export async function POST(request) {
  try {
    const { email, password, fullName, secretKey } = await request.json();

    // Check for admin secret key (should be set in environment variables)
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'admin-secret-key-change-in-production';
    
    if (secretKey !== adminSecret) {
      return NextResponse.json(
        { error: 'Invalid admin secret key' },
        { status: 403 }
      );
    }

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      // If user exists but is not admin, update their role
      if (existingUser.role !== 'admin') {
        await db.collection('users').updateOne(
          { _id: existingUser._id },
          { $set: { role: 'admin', updatedAt: new Date() } }
        );
        return NextResponse.json({
          message: 'User upgraded to admin successfully',
          user: {
            _id: existingUser._id,
            email: existingUser.email,
            fullName: existingUser.fullName,
            role: 'admin',
          }
        });
      }
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = {
      email,
      password: hashedPassword,
      fullName,
      role: 'admin',
      kycVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newAdmin);

    return NextResponse.json({
      _id: result.insertedId,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      role: newAdmin.role,
    }, { status: 201 });
  } catch (error) {
    console.error('[v0] Admin registration error:', error);
    return NextResponse.json(
      { error: 'Admin registration failed' },
      { status: 500 }
    );
  }
}


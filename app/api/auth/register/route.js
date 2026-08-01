import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';
import { mobileEmail, isMobileEmail } from '@/lib/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { password, fullName, role } = body;

    const phone = String(body.phone || '').replace(/\D/g, '').slice(-10);
    let email = String(body.email || '').trim().toLowerCase();

    if (!password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 });
    }

    // The email is optional when a mobile number is given — one of the two must
    // identify the account
    if (!phone && !email) {
      return NextResponse.json(
        { error: 'A mobile number or an email address is required' },
        { status: 400 }
      );
    }

    // A supplied address must look real; a generated one is exempt
    const suppliedEmail = email && !isMobileEmail(email) ? email : '';
    if (suppliedEmail && !EMAIL_PATTERN.test(suppliedEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    if (!email) email = mobileEmail(phone);

    const db = await getDatabase();

    // Both the email and the mobile number can be used to sign in, so neither
    // may already belong to another account
    const existingUser = await db.collection('users').findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      const takenByPhone = phone && existingUser.phone === phone;
      return NextResponse.json(
        {
          error: takenByPhone
            ? 'This mobile number is already registered'
            : 'This email is already registered',
          field: takenByPhone ? 'phone' : 'email',
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      fullName: String(fullName).trim(),
      role,
      phone,
      kycVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      {
        _id: result.insertedId,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[auth/register] error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

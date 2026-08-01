import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { mobileEmail } from '@/lib/auth';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Users may sign in with either their mobile number or their email address.
 * Anything that is 10 digits (optionally with +91 / spaces / dashes) and has no
 * "@" is treated as a mobile number.
 */
function parseIdentifier(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;

  if (!value.includes('@')) {
    const digits = value.replace(/\D/g, '');
    const mobile = digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits;
    if (/^[6-9]\d{9}$/.test(mobile)) return { type: 'mobile', value: mobile };
    // Digits that aren't a valid Indian mobile — report it as a mobile problem
    if (/^\d+$/.test(digits)) return { type: 'mobile', value: null };
  }

  return { type: 'email', value: value.toLowerCase() };
}

export async function POST(request) {
  try {
    // `identifier` is the current field; `email` is kept for older callers
    const { identifier, email, password } = await request.json();
    const parsed = parseIdentifier(identifier ?? email);

    if (!parsed || !password) {
      return NextResponse.json(
        { error: 'Mobile number or email and password are required' },
        { status: 400 }
      );
    }

    const wrongCredentials = parsed.type === 'mobile'
      ? 'Invalid mobile number or password'
      : 'Invalid email or password';

    if (!parsed.value) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number' }, { status: 400 });
    }

    const db = await getDatabase();
    let candidates;

    if (parsed.type === 'mobile') {
      // Match on the stored phone, or on the synthetic email for accounts
      // created before the phone number was persisted. A handful of numbers
      // have both (the same person signed up twice), so keep every match and
      // let the password decide which account they meant.
      candidates = await db.collection('users').find({
        $or: [
          { phone: parsed.value },
          { email: mobileEmail(parsed.value) },
        ],
      }).toArray();
    } else {
      candidates = await db.collection('users').find({ email: parsed.value }).toArray();
      if (!candidates.length) {
        // Older records may have been stored with mixed casing
        candidates = await db.collection('users').find({
          email: { $regex: `^${escapeRegex(parsed.value)}$`, $options: 'i' },
        }).toArray();
      }
    }

    let user = null;
    for (const candidate of candidates) {
      if (candidate.password && await bcrypt.compare(password, candidate.password)) {
        user = candidate;
        break;
      }
    }

    if (!user) {
      return NextResponse.json({ error: wrongCredentials }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const response = {
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || '',
        role: user.role,
        kycVerified: user.kycVerified,
      },
    };

    const res = NextResponse.json(response);
    res.cookies.set('landbid_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error('[auth/login] error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

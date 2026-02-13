import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  iat?: number;
  exp?: number;
}

export function verifyToken(token?: string): TokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('[v0] Token verification error:', error);
    return null;
  }
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
}

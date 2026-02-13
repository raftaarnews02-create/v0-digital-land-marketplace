import jwt from 'jsonwebtoken';

/**
 * @typedef {Object} TokenPayload
 * @property {string} userId
 * @property {string} email
 * @property {'buyer' | 'seller' | 'admin'} role
 * @property {number} [iat]
 * @property {number} [exp]
 */

/**
 * Verify JWT token
 * @param {string} [token]
 * @returns {TokenPayload | null}
 */
export function verifyToken(token) {
  if (!token) {
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error('[v0] Token verification error:', error);
    return null;
  }
}

/**
 * Generate JWT token
 * @param {Omit<TokenPayload, 'iat' | 'exp'>} payload
 * @returns {string}
 */
export function generateToken(payload) {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
}

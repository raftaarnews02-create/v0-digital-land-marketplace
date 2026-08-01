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
/**
 * Accounts registered without an email get a synthetic one in this domain so
 * every user still has a unique key. It is internal — never shown or asked for.
 */
export const MOBILE_EMAIL_DOMAIN = 'user.myzameen.in';

/** @param {string} mobile */
export const mobileEmail = (mobile) => `${mobile}@${MOBILE_EMAIL_DOMAIN}`;

/** True when an email was generated from a mobile number rather than supplied. */
export const isMobileEmail = (email) => String(email || '').endsWith(`@${MOBILE_EMAIL_DOMAIN}`);

export function generateToken(payload) {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
}

/**
 * Read the bearer token off a request and return its payload.
 * @param {Request} request
 * @returns {TokenPayload | null}
 */
export function getAuth(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return verifyToken(token);
}

/**
 * Same as getAuth, but only resolves for admin accounts.
 * @param {Request} request
 * @returns {TokenPayload | null}
 */
export function getAdmin(request) {
  const decoded = getAuth(request);
  return decoded?.role === 'admin' ? decoded : null;
}

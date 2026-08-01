import { ObjectId } from 'mongodb';

/**
 * Contact details on a listing are hidden by default so buyers cannot take the
 * deal off the platform. Access opens up only when one of these is true:
 *
 *  - the viewer owns the listing, or is an admin
 *  - an admin approved this buyer's contact request for this listing
 *  - the seller picked this buyer's bid as the winner
 */

export const CONTACT_REQUEST_STATUSES = ['pending', 'approved', 'rejected'];

/**
 * @param {import('mongodb').Db} db
 * @param {{propertyId: ObjectId, viewerId?: string, isSeller?: boolean, isAdmin?: boolean}} ctx
 * @returns {Promise<{unlocked: boolean, reason: string|null, request: object|null}>}
 */
export async function getContactAccess(db, { propertyId, viewerId, isSeller, isAdmin }) {
  if (isAdmin) return { unlocked: true, reason: 'admin', request: null };
  if (isSeller) return { unlocked: true, reason: 'owner', request: null };
  if (!viewerId) return { unlocked: false, reason: null, request: null };

  let buyerId;
  try {
    buyerId = new ObjectId(viewerId);
  } catch {
    return { unlocked: false, reason: null, request: null };
  }

  const request = await db.collection('contactRequests').findOne({ propertyId, buyerId });
  if (request?.status === 'approved') {
    return { unlocked: true, reason: 'approved_request', request };
  }

  // Winning bidders always get the seller's details — the deal is already done
  const acceptedBid = await db.collection('bids').findOne({
    propertyId,
    buyerId,
    status: 'accepted',
  });
  if (acceptedBid) {
    return { unlocked: true, reason: 'winning_bid', request };
  }

  return { unlocked: false, reason: null, request: request || null };
}

/** Strips a contact down to what an unapproved viewer is allowed to see. */
export function maskContact(user) {
  if (!user) return null;
  const name = user.fullName || 'Seller';
  return {
    // "Rajesh Kumar" -> "Rajesh K."
    name: name.split(' ')[0] + (name.split(' ')[1] ? ` ${name.split(' ')[1][0]}.` : ''),
    verified: !!user.kycVerified,
    locked: true,
  };
}

export function fullContact(user) {
  if (!user) return null;
  return {
    name: user.fullName || 'Seller',
    phone: user.phone || null,
    email: user.email || null,
    verified: !!user.kycVerified,
    locked: false,
  };
}

// Database Models for LandHub Marketplace

/**
 * @typedef {Object} User
 * @property {string} [_id]
 * @property {string} email
 * @property {string} password
 * @property {string} fullName
 * @property {'buyer' | 'seller' | 'admin'} role
 * @property {string} [phone]
 * @property {string} [address]
 * @property {string} [profileImage]
 * @property {boolean} kycVerified
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Property
 * @property {string} [_id]
 * @property {string} sellerId
 * @property {string} title
 * @property {string} description
 * @property {Object} location
 * @property {number} location.latitude
 * @property {number} location.longitude
 * @property {string} location.address
 * @property {string} location.city
 * @property {string} location.state
 * @property {string} location.pincode
 * @property {number} area
 * @property {'sqft' | 'sqm'} areaUnit
 * @property {number} basePrice
 * @property {string[]} images
 * @property {Document[]} documents
 * @property {'draft' | 'active' | 'sold' | 'inactive'} status
 * @property {'agricultural' | 'residential' | 'commercial' | 'industrial'} category
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} [expiryDate]
 */

/**
 * @typedef {Object} Bid
 * @property {string} [_id]
 * @property {string} propertyId
 * @property {string} buyerId
 * @property {number} amount
 * @property {'pending' | 'accepted' | 'rejected' | 'withdrawn'} status
 * @property {string} [message]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Document
 * @property {string} [_id]
 * @property {string} name
 * @property {'title_deed' | 'survey_report' | 'tax_document' | 'khasra' | 'map' | 'other'} type
 * @property {string} url
 * @property {Date} uploadedAt
 */

/**
 * @typedef {Object} Message
 * @property {string} [_id]
 * @property {string} senderId
 * @property {string} recipientId
 * @property {string} [propertyId]
 * @property {string} [bidId]
 * @property {string} content
 * @property {boolean} read
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Notification
 * @property {string} [_id]
 * @property {string} userId
 * @property {'bid' | 'message' | 'offer' | 'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} [relatedId]
 * @property {boolean} read
 * @property {Date} createdAt
 */

module.exports = {};

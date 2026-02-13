// Database Models for LandHub Marketplace

export interface User {
  _id?: string;
  email: string;
  password: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  profileImage?: string;
  kycVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  _id?: string;
  sellerId: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  area: number; // in square meters
  areaUnit: 'sqft' | 'sqm';
  basePrice: number;
  images: string[];
  documents: Document[];
  status: 'draft' | 'active' | 'sold' | 'inactive';
  category: 'agricultural' | 'residential' | 'commercial' | 'industrial';
  createdAt: Date;
  updatedAt: Date;
  expiryDate?: Date;
}

export interface Bid {
  _id?: string;
  propertyId: string;
  buyerId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  _id?: string;
  name: string;
  type: 'title_deed' | 'survey_report' | 'tax_document' | 'khasra' | 'map' | 'other';
  url: string;
  uploadedAt: Date;
}

export interface Message {
  _id?: string;
  senderId: string;
  recipientId: string;
  propertyId?: string;
  bidId?: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Notification {
  _id?: string;
  userId: string;
  type: 'bid' | 'message' | 'offer' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}

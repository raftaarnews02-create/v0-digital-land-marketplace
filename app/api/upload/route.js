import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'image'; // image or document

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;

    // Check if Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // If Cloudinary is not configured, return a placeholder URL
      // In production, you would want to set up Cloudinary
      console.warn('[v0] Cloudinary not configured, using placeholder');
      
      // For demo purposes, return a placeholder
      return NextResponse.json({
        url: `https://placeholder.com/${file.name}`,
        publicId: `placeholder_${Date.now()}`,
        message: 'Using placeholder (Cloudinary not configured)',
      });
    }

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;
    
    const formDataUpload = new FormData();
    formDataUpload.append('file', `data:${mimeType};base64,${base64}`);
    formDataUpload.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default');

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[v0] Cloudinary upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    });
  } catch (error) {
    console.error('[v0] Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE - Remove uploaded file
export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID required' },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ message: 'Cloudinary not configured' });
    }

    // Delete from Cloudinary using admin API
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = require('crypto')
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('sha1');

    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    
    const formDataDelete = new FormData();
    formDataDelete.append('public_id', publicId);
    formDataDelete.append('timestamp', timestamp.toString());
    formDataDelete.append('api_key', apiKey);
    formDataDelete.append('signature', signature);

    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formDataDelete,
    });

    if (!response.ok) {
      console.error('[v0] Cloudinary delete error');
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('[v0] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}


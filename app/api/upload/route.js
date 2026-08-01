import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { uploadToCloudinary, deleteFromCloudinary, getCloudinaryConfig } from '@/lib/cloudinary';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf'];

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!getCloudinaryConfig()) {
      return NextResponse.json(
        { error: 'File uploads are not configured on this server' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const kind = formData.get('type') === 'document' ? 'document' : 'image';

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${MAX_BYTES / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    const allowed = kind === 'document' ? DOCUMENT_TYPES : IMAGE_TYPES;
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          error: kind === 'document'
            ? 'Upload a PDF or an image (JPG, PNG, WEBP).'
            : 'Upload an image (JPG, PNG, WEBP).',
        },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await uploadToCloudinary(dataUri, {
      folder: kind === 'document' ? 'landbid/documents' : 'landbid/properties',
      // `auto` lets Cloudinary store PDFs as raw and images as images
      resourceType: kind === 'document' ? 'auto' : 'image',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[upload] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicId, resourceType } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 });
    }

    await deleteFromCloudinary(publicId, resourceType || 'image');
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('[upload] delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: error.status || 500 }
    );
  }
}

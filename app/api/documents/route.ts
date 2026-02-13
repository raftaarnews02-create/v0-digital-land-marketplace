import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const propertyId = formData.get('propertyId') as string
    const documentType = formData.get('documentType') as string
    const file = formData.get('file') as File

    if (!propertyId || !documentType || !file) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // TODO: Upload to file storage service (e.g., AWS S3, Vercel Blob)
    // const buffer = await file.arrayBuffer()
    // const fileName = `${propertyId}/${documentType}/${Date.now()}-${file.name}`
    // await uploadToStorage(buffer, fileName)

    return NextResponse.json(
      {
        message: 'Document uploaded successfully',
        document: {
          id: 'doc_' + Date.now(),
          propertyId,
          documentType,
          fileName: file.name,
          status: 'pending_verification',
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { message: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const propertyId = request.nextUrl.searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { message: 'Property ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch documents from MongoDB
    // const documents = await db.collection('documents')
    //   .find({ propertyId })
    //   .toArray()

    const documents = [
      {
        id: 'doc_1',
        propertyId,
        name: 'Khasra Certificate',
        type: 'khasra',
        status: 'verified',
        uploadedBy: 'Rajesh Kumar',
        uploadedAt: '2024-02-01',
        fileSize: '2.4 MB',
      },
      {
        id: 'doc_2',
        propertyId,
        name: 'Land Ownership Deed',
        type: 'deed',
        status: 'verified',
        uploadedBy: 'Rajesh Kumar',
        uploadedAt: '2024-02-01',
        fileSize: '3.1 MB',
      },
      {
        id: 'doc_3',
        propertyId,
        name: 'Tax Payment Receipt',
        type: 'tax',
        status: 'verified',
        uploadedBy: 'Rajesh Kumar',
        uploadedAt: '2024-02-02',
        fileSize: '1.8 MB',
      },
    ]

    return NextResponse.json({ documents }, { status: 200 })
  } catch (error) {
    console.error('Fetch documents error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const documentId = request.nextUrl.searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json(
        { message: 'Document ID is required' },
        { status: 400 }
      )
    }

    // TODO: Delete document from storage and MongoDB
    // await deleteFromStorage(documentId)
    // await db.collection('documents').deleteOne({ _id: new ObjectId(documentId) })

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Document deletion error:', error)
    return NextResponse.json(
      { message: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
